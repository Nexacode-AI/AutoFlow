"""Security primitives — password hashing and JWT tokens.

This is shared infrastructure. Feature owners (P1 auth) build the
login/user flows on top of these helpers; do not duplicate them.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.infrastructure.config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Passwords ──────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """Hash a plain-text password for storage."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain-text password against a stored hash."""
    return _pwd_context.verify(plain_password, hashed_password)


# ── JWT ────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
    expires_minutes: int | None = None,
) -> str:
    """Create a signed JWT access token.

    `subject` is the user id (stored in the `sub` claim).
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(
        payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and verify a JWT. Returns the claims, or None if invalid."""
    try:
        return jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
    except JWTError:
        return None
