"""Authentication use cases — register, login, token management."""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dto.auth import (
    LoginRequest,
    RegisterUserRequest,
    TokenResponse,
    UserResponse,
)
from app.infrastructure.base import UserRole
from app.infrastructure.config import database_settings
from app.infrastructure.models.models import Role, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def _create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=database_settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, database_settings.SECRET_KEY, algorithm=ALGORITHM)


async def authenticate_user(
    session: AsyncSession,
    payload: LoginRequest,
) -> TokenResponse:
    """Validate credentials and return a JWT token."""
    result = await session.execute(
        select(User)
        .options(selectinload(User.role))
        .where(User.email == payload.email)
    )
    user = result.scalar_one_or_none()

    if user is None or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token = _create_access_token(
        data={
            "sub": user.user_id,
            "role": user.role.role_name.value,
        }
    )
    return TokenResponse(access_token=token)


async def register_user(
    session: AsyncSession,
    payload: RegisterUserRequest,
    current_user_role: str,
) -> UserResponse:
    """Create a new user. Only super_admin can create admins; super_admin and admin can create bay."""
    # Validate requested role
    try:
        requested_role = UserRole(payload.role_name)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {[r.value for r in UserRole]}",
        )

    # Permission checks
    caller_role = UserRole(current_user_role)
    if requested_role == UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create super_admin users via API",
        )
    if requested_role == UserRole.ADMIN and caller_role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super_admin can create admin users",
        )
    if caller_role == UserRole.BAY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bay users cannot create other users",
        )

    # Check email uniqueness
    existing = await session.execute(
        select(User).where(User.email == payload.email)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Resolve role_id
    role_result = await session.execute(
        select(Role).where(Role.role_name == requested_role)
    )
    role = role_result.scalar_one_or_none()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Role not found — run database seed first",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=pwd_context.hash(payload.password),
        role_id=role.role_id,
        is_active=True,
    )
    session.add(user)
    await session.flush()

    return UserResponse(
        id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=requested_role.value,
        is_active=user.is_active,
    )


async def get_user_by_id(
    session: AsyncSession,
    user_id: str,
) -> Optional[User]:
    """Fetch user with role eagerly loaded."""
    result = await session.execute(
        select(User)
        .options(selectinload(User.role))
        .where(User.user_id == user_id)
    )
    return result.scalar_one_or_none()
