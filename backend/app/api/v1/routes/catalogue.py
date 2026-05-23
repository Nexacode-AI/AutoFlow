"""Parts catalogue — categories and parts CRUD.

Routes (all under /api/v1/catalogue):
    GET    /categories              list all active categories (all authenticated roles)
    POST   /categories              create category (admin+)
    PUT    /categories/{id}         update category (admin+)
    DELETE /categories/{id}         soft-delete if no parts linked (admin+)

    GET    /parts                   list parts, ?category_id=&search= (all authenticated roles)
    POST   /parts                   create part (admin+)
    PUT    /parts/{id}              update part (admin+)
    DELETE /parts/{id}              soft-delete part (admin+)
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.dependencies import CurrentUser, DbSession, require_roles
from app.infrastructure.base import PartGrade, UserRole
from app.infrastructure.models.models import PartCategory, PartsCatalogue

router = APIRouter(prefix="/catalogue", tags=["catalogue"])

# Shorthand for admin-only dependency
_admin = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.ADMIN))


# ──────────────────────────────────────────────
# Pydantic Schemas
# ──────────────────────────────────────────────

class CategoryOut(BaseModel):
    id: str
    name: str
    description: str | None
    icon: str | None
    sort_order: int
    parts_count: int


class CategoryCreate(BaseModel):
    name: str
    description: str | None = None
    icon: str | None = None
    sort_order: int = 0

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v.strip()


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon: str | None = None
    sort_order: int | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("name must not be blank")
        return v.strip() if v else v


class PartOut(BaseModel):
    id: str
    category_id: str
    category_name: str
    name: str
    grade: str
    warranty_months: int
    is_active: bool


class PartCreate(BaseModel):
    category_id: str
    name: str
    grade: PartGrade
    warranty_months: int

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v.strip()

    @field_validator("warranty_months")
    @classmethod
    def warranty_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("warranty_months must be >= 0")
        return v


class PartUpdate(BaseModel):
    category_id: str | None = None
    name: str | None = None
    grade: PartGrade | None = None
    warranty_months: int | None = None
    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("name must not be blank")
        return v.strip() if v else v

    @field_validator("warranty_months")
    @classmethod
    def warranty_non_negative(cls, v: int | None) -> int | None:
        if v is not None and v < 0:
            raise ValueError("warranty_months must be >= 0")
        return v


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

async def _parts_count(db: DbSession, category_id: str) -> int:
    result = await db.scalar(
        select(func.count(PartsCatalogue.catalogue_id))
        .where(PartsCatalogue.category_id == category_id)
        .where(PartsCatalogue.deleted_at.is_(None))
        .where(PartsCatalogue.is_active == True)  # noqa: E712
    )
    return result or 0


# ──────────────────────────────────────────────
# Category Endpoints
# ──────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: DbSession, _: CurrentUser) -> list[CategoryOut]:
    """List all active categories ordered by sort_order then name."""
    result = await db.execute(
        select(PartCategory)
        .where(PartCategory.is_active == True)  # noqa: E712
        .order_by(PartCategory.sort_order, PartCategory.category_name)
    )
    categories = result.scalars().all()

    # Bulk-fetch parts counts
    counts_result = await db.execute(
        select(PartsCatalogue.category_id, func.count(PartsCatalogue.catalogue_id))
        .where(PartsCatalogue.deleted_at.is_(None))
        .where(PartsCatalogue.is_active == True)  # noqa: E712
        .group_by(PartsCatalogue.category_id)
    )
    counts: dict[str, int] = dict(counts_result.all())

    return [
        CategoryOut(
            id=c.category_id,
            name=c.category_name,
            description=c.description,
            icon=c.icon,
            sort_order=c.sort_order,
            parts_count=counts.get(c.category_id, 0),
        )
        for c in categories
    ]


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(body: CategoryCreate, db: DbSession, _=_admin) -> CategoryOut:
    """Create a new part category. Admin only."""
    existing = await db.scalar(
        select(PartCategory).where(PartCategory.category_name == body.name)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        )

    cat = PartCategory(
        category_name=body.name,
        description=body.description,
        icon=body.icon,
        sort_order=body.sort_order,
    )
    db.add(cat)
    await db.flush()

    return CategoryOut(
        id=cat.category_id,
        name=cat.category_name,
        description=cat.description,
        icon=cat.icon,
        sort_order=cat.sort_order,
        parts_count=0,
    )


@router.put("/categories/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: str, body: CategoryUpdate, db: DbSession, _=_admin
) -> CategoryOut:
    """Update a category. Admin only."""
    cat = await db.get(PartCategory, category_id)
    if not cat or not cat.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    if body.name is not None:
        dup = await db.scalar(
            select(PartCategory).where(
                PartCategory.category_name == body.name,
                PartCategory.category_id != category_id,
            )
        )
        if dup:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A category with this name already exists.",
            )
        cat.category_name = body.name

    if body.description is not None:
        cat.description = body.description
    if body.icon is not None:
        cat.icon = body.icon
    if body.sort_order is not None:
        cat.sort_order = body.sort_order

    await db.flush()
    count = await _parts_count(db, category_id)

    return CategoryOut(
        id=cat.category_id,
        name=cat.category_name,
        description=cat.description,
        icon=cat.icon,
        sort_order=cat.sort_order,
        parts_count=count,
    )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, db: DbSession, _=_admin) -> None:
    """Soft-delete a category — only if no active parts are linked. Admin only."""
    cat = await db.get(PartCategory, category_id)
    if not cat or not cat.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    linked = await db.scalar(
        select(func.count(PartsCatalogue.catalogue_id))
        .where(PartsCatalogue.category_id == category_id)
        .where(PartsCatalogue.deleted_at.is_(None))
    )
    if linked and linked > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete: {linked} part(s) are linked to this category. Delete or reassign them first.",
        )

    cat.is_active = False
    await db.flush()


# ──────────────────────────────────────────────
# Parts Endpoints
# ──────────────────────────────────────────────

@router.get("/parts", response_model=list[PartOut])
async def list_parts(
    db: DbSession,
    _: CurrentUser,
    category_id: str | None = Query(None, description="Filter by category ID"),
    search: str | None = Query(None, description="Full-text search on part name"),
) -> list[PartOut]:
    """List active catalogue parts. All authenticated roles."""
    stmt = (
        select(PartsCatalogue)
        .join(PartCategory, PartsCatalogue.category_id == PartCategory.category_id)
        .where(PartsCatalogue.deleted_at.is_(None))
        .where(PartsCatalogue.is_active == True)  # noqa: E712
        .options(selectinload(PartsCatalogue.category))
        .order_by(PartCategory.sort_order, PartCategory.category_name, PartsCatalogue.name)
    )
    if category_id:
        stmt = stmt.where(PartsCatalogue.category_id == category_id)
    if search:
        stmt = stmt.where(PartsCatalogue.name.ilike(f"%{search.strip()}%"))

    result = await db.execute(stmt)
    parts = result.scalars().all()

    return [
        PartOut(
            id=p.catalogue_id,
            category_id=p.category_id,
            category_name=p.category.category_name,
            name=p.name,
            grade=p.grade.value,
            warranty_months=p.warranty_months,
            is_active=p.is_active,
        )
        for p in parts
    ]


@router.post("/parts", response_model=PartOut, status_code=status.HTTP_201_CREATED)
async def create_part(body: PartCreate, db: DbSession, _=_admin) -> PartOut:
    """Add a new part to the catalogue. Admin only."""
    cat = await db.get(PartCategory, body.category_id)
    if not cat or not cat.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    part = PartsCatalogue(
        category_id=body.category_id,
        name=body.name,
        grade=body.grade,
        warranty_months=body.warranty_months,
    )
    db.add(part)
    await db.flush()

    return PartOut(
        id=part.catalogue_id,
        category_id=part.category_id,
        category_name=cat.category_name,
        name=part.name,
        grade=part.grade.value,
        warranty_months=part.warranty_months,
        is_active=part.is_active,
    )


@router.put("/parts/{part_id}", response_model=PartOut)
async def update_part(part_id: str, body: PartUpdate, db: DbSession, _=_admin) -> PartOut:
    """Update a catalogue part. Admin only."""
    part = await db.get(PartsCatalogue, part_id, options=[selectinload(PartsCatalogue.category)])
    if not part or part.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found.")

    if body.category_id is not None:
        new_cat = await db.get(PartCategory, body.category_id)
        if not new_cat or not new_cat.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        part.category_id = body.category_id

    if body.name is not None:
        part.name = body.name
    if body.grade is not None:
        part.grade = body.grade
    if body.warranty_months is not None:
        part.warranty_months = body.warranty_months
    if body.is_active is not None:
        part.is_active = body.is_active

    await db.flush()
    await db.refresh(part, ["category"])

    return PartOut(
        id=part.catalogue_id,
        category_id=part.category_id,
        category_name=part.category.category_name,
        name=part.name,
        grade=part.grade.value,
        warranty_months=part.warranty_months,
        is_active=part.is_active,
    )


@router.delete("/parts/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_part(part_id: str, db: DbSession, _=_admin) -> None:
    """Soft-delete a catalogue part. Admin only."""
    part = await db.get(PartsCatalogue, part_id)
    if not part or part.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found.")

    part.deleted_at = datetime.utcnow()
    await db.flush()
