"""Admin API routes — system configuration and statistics.

These routes provide administrative visibility into the system:
- GET /admin/system-info - System info (SUPER_ADMIN only)
- GET /admin/dashboard   - Admin dashboard summary (ADMIN+)

User CRUD lives under /users (see users.py).
"""
from fastapi import APIRouter
from sqlalchemy import func, select

from app.api.dependencies import DbSession, RequireAdmin, RequireSuperAdmin
from app.infrastructure.models.models import Role, User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/system-info")
async def get_system_info(user: RequireSuperAdmin, db: DbSession):
    """Get system configuration and statistics.

    Requires: SUPER_ADMIN role only
    """
    result = await db.execute(
        select(Role.role_name, func.count(User.user_id))
        .join(User, User.role_id == Role.role_id, isouter=True)
        .group_by(Role.role_name)
    )
    role_counts = {row[0].value: row[1] for row in result}

    return {
        "system": "AutoFlow Workshop Management",
        "version": "0.1.0",
        "user_count": sum(role_counts.values()),
        "users_by_role": role_counts,
    }


@router.get("/dashboard")
async def admin_dashboard(user: RequireAdmin, db: DbSession):
    """Get admin dashboard summary.

    Requires: ADMIN or SUPER_ADMIN role
    """
    total_users = await db.scalar(select(func.count(User.user_id)))
    active_users = await db.scalar(
        select(func.count(User.user_id)).where(User.is_active)
    )

    return {
        "dashboard": {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
        },
    }
