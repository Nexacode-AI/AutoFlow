"""Auth-related Pydantic schemas (request / response).

Response models use camelCase aliases to match frontend conventions.
"""
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional


def _to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
    )


# ── Requests ─────────────────────────────────────

class LoginRequest(CamelModel):
    email: str = Field(min_length=3, max_length=150)
    password: str = Field(min_length=6, max_length=128)


class RegisterUserRequest(CamelModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=20)
    password: str = Field(min_length=6, max_length=128)
    role_name: str = Field(
        description="One of: super_admin, admin, bay"
    )


# ── Responses ────────────────────────────────────

class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(CamelModel):
    id: str = Field(alias="id")
    name: str
    email: Optional[str]
    phone: Optional[str]
    role: str = Field(alias="role")
    is_active: bool


class MessageResponse(CamelModel):
    message: str
