"""User Management API routes — CRUD operations for user administration.

All endpoints require SUPER_ADMIN role for security.
"""
import uuid
from typing import Annotated

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.dependencies import DbSession, RequireSuperAdmin
from app.core.security import hash_password
from app.infrastructure.base import UserRole
from app.infrastructure.models.models import Role, User

router = APIRouter(prefix="/users", tags=["users"])


# ── Request/Response Models ──


class UserCreateRequest(BaseModel):
    name: str
    email: str  # Using str instead of EmailStr to allow .local domains in dev
    password: str
    role: UserRole


class UserUpdateRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str | None
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# ── Endpoints ──


@router.get("/", response_model=list[UserResponse])
async def list_users(
    current_user: RequireSuperAdmin,
    db: DbSession,
    role: UserRole | None = None,
    is_active: bool | None = None,
):
    """List all users in the system with optional filtering.

    Query Parameters:
        role: Filter by role (bay, admin, super_admin)
        is_active: Filter by active status (true/false)

    Requires: SUPER_ADMIN role
    """
    # Build query with filters
    query = select(User).options(selectinload(User.role))

    if role is not None:
        role_obj = await db.scalar(select(Role).where(Role.role_name == role))
        if role_obj:
            query = query.where(User.role_id == role_obj.role_id)

    if is_active is not None:
        query = query.where(User.is_active == is_active)

    result = await db.execute(query)
    users = result.scalars().all()

    return [
        UserResponse(
            user_id=u.user_id,
            name=u.name,
            email=u.email,
            role=u.role.role_name.value,
            is_active=u.is_active,
        )
        for u in users
    ]


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    current_user: RequireSuperAdmin,
    db: DbSession,
    request: UserCreateRequest,
):
    """Create a new user.

    Requires: SUPER_ADMIN role
    """
    # Check if email already exists
    existing = await db.scalar(select(User).where(User.email == request.email))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email {request.email} already exists",
        )

    # Get role
    role = await db.scalar(select(Role).where(Role.role_name == request.role))
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {request.role}",
        )

    # Create user
    new_user = User(
        user_id=str(uuid.uuid4()),
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role_id=role.role_id,
        is_active=True,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Load role for response
    await db.refresh(new_user, ["role"])

    return UserResponse(
        user_id=new_user.user_id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role.role_name.value,
        is_active=new_user.is_active,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    current_user: RequireSuperAdmin,
    db: DbSession,
    user_id: str,
):
    """Get a specific user by ID.

    Requires: SUPER_ADMIN role
    """
    result = await db.execute(
        select(User).where(User.user_id == user_id).options(selectinload(User.role))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )

    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role.role_name.value,
        is_active=user.is_active,
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    current_user: RequireSuperAdmin,
    db: DbSession,
    user_id: str,
    request: UserUpdateRequest,
):
    """Update a user's information.

    Requires: SUPER_ADMIN role
    """
    # Get user
    result = await db.execute(
        select(User).where(User.user_id == user_id).options(selectinload(User.role))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )

    # Update fields
    if request.name is not None:
        user.name = request.name

    if request.email is not None:
        # Check if new email already exists
        existing = await db.scalar(
            select(User).where(User.email == request.email, User.user_id != user_id)
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email {request.email} already exists",
            )
        user.email = request.email

    if request.role is not None:
        role = await db.scalar(select(Role).where(Role.role_name == request.role))
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {request.role}",
            )
        user.role_id = role.role_id

    if request.is_active is not None:
        user.is_active = request.is_active

    await db.commit()
    await db.refresh(user, ["role"])

    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role.role_name.value,
        is_active=user.is_active,
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    current_user: RequireSuperAdmin,
    db: DbSession,
    user_id: str,
):
    """Deactivate a user (soft delete).

    Requires: SUPER_ADMIN role
    """
    user = await db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )

    # Prevent deleting yourself
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )

    # Soft delete - just deactivate
    user.is_active = False
    await db.commit()


@router.post("/{user_id}/reset-password")
async def admin_reset_password(
    current_user: RequireSuperAdmin,
    db: DbSession,
    user_id: str,
    new_password: Annotated[str, BaseModel],
):
    """Admin-triggered password reset.

    Allows super admin to reset any user's password directly.

    Requires: SUPER_ADMIN role
    """
    user = await db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )

    user.password_hash = hash_password(new_password)
    await db.commit()

    return {"message": f"Password reset successfully for user {user.name}"}
