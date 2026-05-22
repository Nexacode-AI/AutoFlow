"""Shared FastAPI dependencies — DB sessions and authentication.

Feature owners reuse these in their route modules:

    @router.get("/jobs")
    async def list_jobs(
        db: DbSession,
        user: CurrentUser,
    ): ...
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.infrastructure.base import UserRole
from app.infrastructure.config import settings
from app.infrastructure.models.models import Role, User
from app.infrastructure.session import get_db

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login"
)

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: DbSession,
) -> User:
    """Resolve the authenticated user from the bearer token."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    claims = decode_access_token(token)
    if claims is None or "sub" not in claims:
        raise credentials_error

    user = await db.get(User, claims["sub"])
    if user is None or not user.is_active:
        raise credentials_error
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*allowed: UserRole):
    """Route guard factory — restrict an endpoint to specific roles.

        @router.delete("/workflows/{id}")
        async def delete(user=Depends(require_roles(UserRole.ADMIN))): ...
    """

    async def _guard(user: CurrentUser, db: DbSession) -> User:
        role = await db.get(Role, user.role_id)
        if role is None or role.role_name not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return _guard
