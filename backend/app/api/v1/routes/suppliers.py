"""Supplier directory — CRUD.

Routes (all under /api/v1/suppliers, admin+ only):
    GET    /suppliers                list active suppliers (?search=, ?include_inactive=)
    POST   /suppliers                create supplier
    GET    /suppliers/{id}           get supplier detail with usage stats
    PUT    /suppliers/{id}           update supplier (partial)
    DELETE /suppliers/{id}           soft-deactivate (blocked if pending orders exist)
"""
import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, field_validator
from sqlalchemy import func, select

from app.api.dependencies import DbSession, require_roles
from app.infrastructure.base import OrderStatus, UserRole
from app.infrastructure.models.models import PartOrder, Supplier

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

_admin = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN))


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _normalize_wa(raw: str | None) -> str | None:
    """Strip +, spaces, hyphens. Validate result is 7–15 digits."""
    if raw is None:
        return None
    digits = re.sub(r"[\s\-\+\(\)]", "", raw)
    if not digits.isdigit() or not (7 <= len(digits) <= 15):
        raise ValueError(
            "WhatsApp number must be 7–15 digits with country code (e.g. 60123456789). "
            "Spaces, hyphens and leading + are stripped automatically."
        )
    return digits


def _wa_link(number: str | None) -> str | None:
    return f"https://wa.me/{number}" if number else None


def _supplier_out(s: Supplier) -> "SupplierOut":
    return SupplierOut(
        id=s.supplier_id,
        name=s.supplier_name,
        phone=s.phone,
        whatsapp_number=s.whatsapp_number,
        wa_link=_wa_link(s.whatsapp_number),
        email=s.email,
        notes=s.notes,
        is_active=s.is_active,
        created_at=s.created_at,
    )


# ──────────────────────────────────────────────
# Pydantic Schemas
# ──────────────────────────────────────────────

class SupplierOut(BaseModel):
    id: str
    name: str
    phone: str | None
    whatsapp_number: str | None
    wa_link: str | None
    email: str | None
    notes: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SupplierDetail(SupplierOut):
    jobs_count: int
    last_used_at: datetime | None


class SupplierCreate(BaseModel):
    name: str
    phone: str | None = None
    whatsapp_number: str | None = None
    email: str | None = None
    notes: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v.strip()

    @field_validator("whatsapp_number")
    @classmethod
    def normalize_wa(cls, v: str | None) -> str | None:
        return _normalize_wa(v)

    @field_validator("email")
    @classmethod
    def email_lowercase(cls, v: str | None) -> str | None:
        return v.strip().lower() if v and v.strip() else None


class SupplierUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    whatsapp_number: str | None = None
    email: str | None = None
    notes: str | None = None
    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("name must not be blank")
        return v.strip() if v else v

    @field_validator("whatsapp_number")
    @classmethod
    def normalize_wa(cls, v: str | None) -> str | None:
        return _normalize_wa(v)

    @field_validator("email")
    @classmethod
    def email_lowercase(cls, v: str | None) -> str | None:
        return v.strip().lower() if v and v.strip() else None


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@router.get("", response_model=list[SupplierOut])
async def list_suppliers(
    db: DbSession,
    user=_admin,
    search: str | None = Query(None, description="Filter by supplier name (case-insensitive)"),
    include_inactive: bool = Query(
        False, description="Include deactivated suppliers (super_admin only)"
    ),
) -> list[SupplierOut]:
    """List suppliers. Default: active only. super_admin can pass include_inactive=true."""
    stmt = select(Supplier).order_by(Supplier.is_active.desc(), Supplier.supplier_name)

    # Only super_admin may see inactive suppliers
    show_inactive = include_inactive and user.role.role_name == UserRole.SUPER_ADMIN
    if not show_inactive:
        stmt = stmt.where(Supplier.is_active == True)  # noqa: E712

    if search:
        stmt = stmt.where(Supplier.supplier_name.ilike(f"%{search.strip()}%"))

    result = await db.execute(stmt)
    suppliers = result.scalars().all()
    return [_supplier_out(s) for s in suppliers]


@router.post("", response_model=SupplierOut, status_code=status.HTTP_201_CREATED)
async def create_supplier(body: SupplierCreate, db: DbSession, _=_admin) -> SupplierOut:
    """Create a new supplier. Admin only."""
    existing = await db.scalar(
        select(Supplier).where(
            func.lower(Supplier.supplier_name) == body.name.lower()
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A supplier with this name already exists.",
        )

    supplier = Supplier(
        supplier_name=body.name,
        phone=body.phone,
        whatsapp_number=body.whatsapp_number,
        email=body.email,
        notes=body.notes,
    )
    db.add(supplier)
    await db.flush()
    return _supplier_out(supplier)


@router.get("/{supplier_id}", response_model=SupplierDetail)
async def get_supplier(supplier_id: str, db: DbSession, _=_admin) -> SupplierDetail:
    """Get a single supplier including usage stats (jobs_count, last_used_at)."""
    supplier = await db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

    jobs_count = await db.scalar(
        select(func.count(PartOrder.order_id)).where(PartOrder.supplier_id == supplier_id)
    ) or 0
    last_used_at = await db.scalar(
        select(func.max(PartOrder.ordered_at)).where(PartOrder.supplier_id == supplier_id)
    )

    return SupplierDetail(
        **_supplier_out(supplier).model_dump(),
        jobs_count=jobs_count,
        last_used_at=last_used_at,
    )


@router.put("/{supplier_id}", response_model=SupplierOut)
async def update_supplier(
    supplier_id: str, body: SupplierUpdate, db: DbSession, _=_admin
) -> SupplierOut:
    """Update a supplier. Only provided fields are changed."""
    supplier = await db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

    if body.name is not None:
        dup = await db.scalar(
            select(Supplier).where(
                func.lower(Supplier.supplier_name) == body.name.lower(),
                Supplier.supplier_id != supplier_id,
            )
        )
        if dup:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A supplier with this name already exists.",
            )
        supplier.supplier_name = body.name

    if body.phone is not None:
        supplier.phone = body.phone
    if body.whatsapp_number is not None:
        supplier.whatsapp_number = body.whatsapp_number
    if body.email is not None:
        supplier.email = body.email
    if body.notes is not None:
        supplier.notes = body.notes
    if body.is_active is not None:
        supplier.is_active = body.is_active

    await db.flush()
    return _supplier_out(supplier)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_supplier(supplier_id: str, db: DbSession, _=_admin) -> None:
    """Soft-deactivate a supplier. Blocked if the supplier has pending (ordered) part orders."""
    supplier = await db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

    if not supplier.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Supplier is already inactive.",
        )

    pending_count = await db.scalar(
        select(func.count(PartOrder.order_id)).where(
            PartOrder.supplier_id == supplier_id,
            PartOrder.status == OrderStatus.ORDERED,
        )
    ) or 0

    if pending_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Cannot deactivate: supplier has {pending_count} pending order(s). "
                "Receive or reassign them first."
            ),
        )

    supplier.is_active = False
    await db.flush()
