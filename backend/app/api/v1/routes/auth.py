"""Authentication routes — login and current-user lookup.

This is the Sprint 0 auth foundation. P1 (Platform / Auth) extends it
with user management, password reset, etc.
"""
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select

from app.api.dependencies import CurrentUser, DbSession, oauth2_scheme
from app.core.security import (
    create_access_token,
    get_token_expiry,
    hash_password,
    verify_password,
)
from app.core.token_blocklist import blocklist
from app.infrastructure.models.models import PasswordResetToken, Role, User

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str | None
    role: str


class ForgotPasswordRequest(BaseModel):
    email: str  # Using str instead of EmailStr to allow .local domains in dev


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


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


@router.post("/logout")
async def logout(
    token: Annotated[str, Depends(oauth2_scheme)],
    user: CurrentUser,
):
    """Invalidate the current access token.

    The token is added to a blocklist and will be rejected on subsequent requests.
    """
    expiry = get_token_expiry(token)
    if expiry:
        blocklist.add(token, expiry)
    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(user: CurrentUser):
    """Issue a new access token for the authenticated user.

    The old token remains valid until it expires naturally.
    Client should discard the old token and use the new one.
    """
    new_token = create_access_token(subject=user.user_id)
    return TokenResponse(access_token=new_token)


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: DbSession):
    """Request a password reset link.

    Generates a secure token and sends it via email (logged for now).
    Returns success even if email doesn't exist (security best practice).
    """
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if user is not None:
        # Generate secure random token
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(UTC) + timedelta(hours=1)

        # Store token in database (remove timezone for PostgreSQL compatibility)
        db_token = PasswordResetToken(
            user_id=user.user_id,
            token=reset_token,
            expires_at=expires_at.replace(tzinfo=None),
        )
        db.add(db_token)
        await db.commit()

        # TODO: Send email with reset link
        # For now, log it (dev mode)
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        print(f"\n{'='*60}")
        print(f"PASSWORD RESET REQUESTED")
        print(f"{'='*60}")
        print(f"User: {user.email}")
        print(f"Reset Link: {reset_link}")
        print(f"Expires: {expires_at}")
        print(f"{'='*60}\n")

    # Always return success (don't leak user existence)
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: DbSession):
    """Reset password using a valid reset token.

    Token must be unused and not expired. Marks token as used after success.
    """
    # Find valid token (use naive datetime for comparison)
    now_naive = datetime.now(UTC).replace(tzinfo=None)
    result = await db.execute(
        select(PasswordResetToken)
        .where(PasswordResetToken.token == request.token)
        .where(PasswordResetToken.used_at.is_(None))
        .where(PasswordResetToken.expires_at > now_naive)
    )
    reset_token = result.scalar_one_or_none()

    if reset_token is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Update user password
    user = await db.get(User, reset_token.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user.password_hash = hash_password(request.new_password)

    # Mark token as used (use naive datetime)
    reset_token.used_at = datetime.now(UTC).replace(tzinfo=None)

    await db.commit()

    return {"message": "Password has been reset successfully"}
