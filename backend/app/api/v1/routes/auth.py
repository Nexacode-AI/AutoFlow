"""Authentication routes — login and current-user lookup.

This is the Sprint 0 auth foundation. P1 (Platform / Auth) extends it
with user management, password reset, etc.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select

from app.api.dependencies import CurrentUser, DbSession
from app.core.security import create_access_token, verify_password
from app.infrastructure.models.models import Role, User

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str | None
    role: str


@router.post("/login", response_model=TokenResponse)
async def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbSession,
):
    """Exchange email + password for a JWT access token.

    The OAuth2 form field `username` carries the user's email.
    """
    result = await db.execute(select(User).where(User.email == form.username))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled"
        )

    token = create_access_token(subject=user.user_id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def read_me(user: CurrentUser, db: DbSession):
    """Return the currently authenticated user."""
    role = await db.get(Role, user.role_id)
    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=role.role_name.value if role else "unknown",
    )
