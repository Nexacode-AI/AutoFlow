"""
FastAPI dependencies — authentication & role-based access control.

Usage in routes:
    @router.get("/protected")
    async def protected(user = Depends(get_current_user)):
        ...

    @router.post("/admin-only")
    async def admin_only(user = Depends(require_role(["super_admin", "admin"]))):
        ...
"""
from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.usecases.auth import get_user_by_id, ALGORITHM
from app.infrastructure.config import database_settings
from app.infrastructure.models.models import User
from app.infrastructure.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the current user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            database_settings.SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_id(session, user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_role(allowed_roles: list[str]) -> Callable:
    """
    Dependency factory that restricts access to specific roles.

    allowed_roles: list of role name strings, e.g. ["super_admin", "admin"]
    """
    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role.role_name.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {allowed_roles}",
            )
        return current_user
    return role_checker
