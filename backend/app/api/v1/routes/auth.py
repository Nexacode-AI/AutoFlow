"""Authentication API routes — login, register, profile."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
from app.application.dto.auth import (
    LoginRequest,
    MessageResponse,
    RegisterUserRequest,
    TokenResponse,
    UserResponse,
)
from app.application.usecases.auth import authenticate_user, register_user
from app.infrastructure.models.models import User
from app.infrastructure.session import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_db),
):
    """Authenticate user and return JWT token."""
    return await authenticate_user(session, payload)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
)
async def register(
    payload: RegisterUserRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "admin"])),
):
    """
    Register a new user (requires admin+ role).

    - super_admin can create admin and bay users
    - admin can create bay users only
    """
    return await register_user(
        session,
        payload,
        current_user_role=current_user.role.role_name.value,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Return the currently authenticated user's profile."""
    return UserResponse(
        id=current_user.user_id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role.role_name.value,
        is_active=current_user.is_active,
    )
