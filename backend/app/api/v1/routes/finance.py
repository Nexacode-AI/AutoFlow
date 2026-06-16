"""Finance routes — Personal Expenses & Bank Statement Categorisation (Issue #20).

Endpoints:
    POST   /finance/personal/bank-statements/upload    — upload a bank PDF, parse it
    GET    /finance/personal/transactions              — list transactions (filterable)
    PATCH  /finance/personal/transactions/{id}/category — recategorize a transaction
    GET    /finance/personal/summary                   — category totals per admin

Access: admin and super_admin only (personal finance data is sensitive).
Privacy model: individual transactions are private to their owner; only
super_admin can view/manage other admins' line items. Combined category
totals (the summary endpoint) are shared across admins.
"""
import logging
import re
import shutil
import uuid
from decimal import Decimal
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select

from app.api.dependencies import DbSession, RequireAdmin
from app.core.pdf_parser import detect_category, parse_bank_statement
from app.infrastructure.base import (
    BankStatementStatus,
    PersonalExpenseCategory,
    UserRole,
)
from app.infrastructure.config import settings
from app.infrastructure.models.models import BankStatement, PersonalExpense, User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/finance/personal", tags=["finance"])

UPLOAD_DIR = Path(settings.UPLOAD_DIR)

_ADMIN_ROLES = (UserRole.ADMIN, UserRole.SUPER_ADMIN)

# ── Category display labels (single source of truth for the API) ──────────────

CATEGORY_LABELS: dict[str, str] = {
    "fuel_transport":        "Fuel & Transport",
    "utilities":             "Utilities",
    "meals_entertainment":   "Meals & Entertainment",
    "office_stationery":     "Office & Stationery",
    "training_development":  "Training & Development",
    "marketing_advertising": "Marketing & Advertising",
    "equipment_maintenance": "Equipment & Maintenance",
    "others":                "Others",
}

# ── Pydantic schemas ──────────────────────────────────────────────────────────


class TransactionOut(BaseModel):
    expense_id: str
    statement_id: str
    admin_id: str
    admin_name: str
    transaction_date: str       # ISO date string
    description: str
    amount: float
    category: str
    category_label: str
    is_recategorized: bool


class StatementOut(BaseModel):
    statement_id: str
    admin_id: str
    filename: str
    status: str
    transaction_count: int
    transactions: list[TransactionOut]


class RecategorizeRequest(BaseModel):
    category: PersonalExpenseCategory


class CategoryTotal(BaseModel):
    category: str
    category_label: str
    total: float
    count: int


class SummaryOut(BaseModel):
    grand_total: float
    unresolved_count: int       # "others" not yet recategorized
    categories: list[CategoryTotal]
    per_admin: dict[str, dict]  # admin_id → {name, total, count}


# ── Helpers ───────────────────────────────────────────────────────────────────


def _is_super_admin(user: User) -> bool:
    return user.role is not None and user.role.role_name == UserRole.SUPER_ADMIN


def _txn_out(expense: PersonalExpense, admin_name: str) -> TransactionOut:
    return TransactionOut(
        expense_id=expense.expense_id,
        statement_id=expense.statement_id,
        admin_id=expense.admin_id,
        admin_name=admin_name,
        transaction_date=expense.transaction_date.date().isoformat(),
        description=expense.description,
        amount=float(expense.amount),
        category=expense.category.value,
        category_label=CATEGORY_LABELS.get(expense.category.value, expense.category.value),
        is_recategorized=expense.is_recategorized,
    )


def _safe_filename(raw: str | None) -> str:
    """Strip any path components and restrict to a safe character set."""
    name = Path(raw or "statement.pdf").name
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name or "statement.pdf"


_PDF_MAGIC = b"%PDF-"


# ── Routes ────────────────────────────────────────────────────────────────────


@router.post(
    "/bank-statements/upload",
    response_model=StatementOut,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a bank statement PDF and auto-categorize transactions",
)
async def upload_bank_statement(
    file: UploadFile,
    admin_id: str,
    current_user: RequireAdmin,
    db: DbSession,
):
    """Accept a bank statement PDF, extract transactions, and store them.

    - `file` — the PDF (multipart/form-data)
    - `admin_id` — UUID of the admin whose statement this belongs to

    Admins may only upload their own statements; super_admin may upload
    for any admin-level user.
    """
    # Privacy: a regular admin can only upload statements for themselves
    if not _is_super_admin(current_user) and admin_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload your own bank statements",
        )

    # Validate the target user exists and holds an admin-level role
    result = await db.execute(select(User).where(User.user_id == admin_id))
    admin = result.scalar_one_or_none()
    if admin is None:
        raise HTTPException(status_code=404, detail="Admin user not found")
    await db.refresh(admin, ["role"])
    if admin.role is None or admin.role.role_name not in _ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Target user is not an admin",
        )

    # Validate actual file content, not just the (spoofable) content type
    head = await file.read(len(_PDF_MAGIC))
    await file.seek(0)
    if head != _PDF_MAGIC:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only PDF files are accepted",
        )

    # Persist the file under a sanitized, collision-free name
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid.uuid4()}_{_safe_filename(file.filename)}"
    file_path = UPLOAD_DIR / safe_name

    with file_path.open("wb") as dest:
        shutil.copyfileobj(file.file, dest)

    # Commit the statement row first so the DB connection is not held open
    # while the (potentially slow) PDF parse runs in a thread pool.
    statement = BankStatement(
        admin_id=admin_id,
        filename=_safe_filename(file.filename),
        file_path=str(file_path),
        status=BankStatementStatus.PROCESSING,
    )
    db.add(statement)
    await db.commit()
    await db.refresh(statement)

    try:
        raw_txns = await parse_bank_statement(str(file_path))
    except Exception as exc:
        logger.error("PDF parse failed for statement %s: %s", statement.statement_id, exc)
        statement.status = BankStatementStatus.FAILED
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract transactions from the uploaded PDF",
        ) from exc

    # Persist transactions and mark the statement complete in a fresh transaction
    expense_records: list[PersonalExpense] = []
    for raw in raw_txns:
        cat_value = detect_category(raw["description"])
        expense = PersonalExpense(
            statement_id=statement.statement_id,
            admin_id=admin_id,
            transaction_date=raw["date"],
            description=raw["description"],
            amount=raw["amount"],
            category=PersonalExpenseCategory(cat_value),
            is_recategorized=False,
        )
        db.add(expense)
        expense_records.append(expense)

    statement.status = BankStatementStatus.COMPLETED
    statement.transaction_count = len(expense_records)
    await db.commit()

    txn_outs = [_txn_out(e, admin.name) for e in expense_records]

    return StatementOut(
        statement_id=statement.statement_id,
        admin_id=admin_id,
        filename=statement.filename,
        status=statement.status.value,
        transaction_count=statement.transaction_count,
        transactions=txn_outs,
    )


@router.get(
    "/transactions",
    response_model=list[TransactionOut],
    summary="List personal expense transactions",
)
async def list_transactions(
    current_user: RequireAdmin,
    db: DbSession,
    admin_id: str | None = None,
    category: str | None = None,
):
    """Return personal transactions.

    Regular admins only ever see their own transactions; super_admin may
    filter by any admin_id or omit it to see everything.
    """
    if not _is_super_admin(current_user):
        if admin_id is not None and admin_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own transactions",
            )
        admin_id = current_user.user_id

    query = select(PersonalExpense)
    if admin_id:
        query = query.where(PersonalExpense.admin_id == admin_id)
    if category:
        try:
            query = query.where(
                PersonalExpense.category == PersonalExpenseCategory(category)
            )
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Unknown category: {category}") from None

    query = query.order_by(PersonalExpense.transaction_date.desc())
    result = await db.execute(query)
    expenses = result.scalars().all()

    # Batch-load admin names to avoid N+1
    admin_ids = {e.admin_id for e in expenses}
    admin_map: dict[str, str] = {}
    if admin_ids:
        admins_result = await db.execute(
            select(User).where(User.user_id.in_(admin_ids))
        )
        admin_map = {u.user_id: u.name for u in admins_result.scalars().all()}

    return [_txn_out(e, admin_map.get(e.admin_id, "Unknown")) for e in expenses]


@router.patch(
    "/transactions/{expense_id}/category",
    response_model=TransactionOut,
    summary="Recategorize a personal expense transaction",
)
async def recategorize_transaction(
    expense_id: str,
    body: RecategorizeRequest,
    current_user: RequireAdmin,
    db: DbSession,
):
    """Update the category of a single transaction and mark it as recategorized.

    Admins may only recategorize their own transactions.
    """
    expense = await db.get(PersonalExpense, expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if not _is_super_admin(current_user) and expense.admin_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only recategorize your own transactions",
        )

    expense.category = body.category
    expense.is_recategorized = True
    await db.commit()

    admin = await db.get(User, expense.admin_id)
    return _txn_out(expense, admin.name if admin else "Unknown")


@router.get(
    "/summary",
    response_model=SummaryOut,
    summary="Category totals for all personal expenses",
)
async def get_summary(
    current_user: RequireAdmin,
    db: DbSession,
):
    """Return spending totals broken down by category and by admin.

    Totals are aggregated as Decimal and rounded once at the end to avoid
    float accumulation drift. Per issue #20, combined totals are shared
    across admins (line items stay private via the transactions endpoint).
    """
    result = await db.execute(
        select(PersonalExpense).order_by(PersonalExpense.transaction_date.desc())
    )
    expenses = result.scalars().all()

    # Gather admin names
    admin_ids = {e.admin_id for e in expenses}
    admin_map: dict[str, str] = {}
    if admin_ids:
        admins_result = await db.execute(
            select(User).where(User.user_id.in_(admin_ids))
        )
        admin_map = {u.user_id: u.name for u in admins_result.scalars().all()}

    # Aggregate with Decimal — convert to float only at serialization
    cat_totals: dict[str, dict] = {}
    per_admin_dec: dict[str, dict] = {}
    grand_total = Decimal("0")
    unresolved = 0

    for exp in expenses:
        cat = exp.category.value
        amt: Decimal = exp.amount
        grand_total += amt

        if cat == "others" and not exp.is_recategorized:
            unresolved += 1

        if cat not in cat_totals:
            cat_totals[cat] = {"total": Decimal("0"), "count": 0}
        cat_totals[cat]["total"] += amt
        cat_totals[cat]["count"] += 1

        aid = exp.admin_id
        if aid not in per_admin_dec:
            per_admin_dec[aid] = {
                "name": admin_map.get(aid, "Unknown"),
                "total": Decimal("0"),
                "count": 0,
            }
        per_admin_dec[aid]["total"] += amt
        per_admin_dec[aid]["count"] += 1

    categories = [
        CategoryTotal(
            category=cat,
            category_label=CATEGORY_LABELS.get(cat, cat),
            total=float(data["total"]),
            count=data["count"],
        )
        for cat, data in cat_totals.items()
    ]
    per_admin = {
        aid: {"name": d["name"], "total": float(d["total"]), "count": d["count"]}
        for aid, d in per_admin_dec.items()
    }

    return SummaryOut(
        grand_total=float(grand_total),
        unresolved_count=unresolved,
        categories=categories,
        per_admin=per_admin,
    )
