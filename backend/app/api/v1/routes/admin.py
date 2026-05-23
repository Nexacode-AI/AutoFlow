"""Admin API routes — user management and system configuration.

These routes demonstrate role-based access control:
- GET /admin/users - List users (ADMIN+ only)
- GET /admin/system-info - System info (SUPER_ADMIN only)
- GET /admin/dashboard - Admin dashboard (ADMIN+ only)
"""
from fastapi import APIRouter

from app.api.dependencies import DbSession, RequireAdmin, RequireSuperAdmin
from app.infrastructure.models.models import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(user: RequireAdmin, db: DbSession):
    """List all users in the system.

    Requires: ADMIN or SUPER_ADMIN role
    """
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    result = await db.execute(select(User).options(selectinload(User.role)))
    users = result.scalars().all()

    return {
        "users": [
            {
                "user_id": u.user_id,
                "name": u.name,
                "email": u.email,
                "is_active": u.is_active,
            }
            for u in users
        ],
        "total": len(users),
        "accessed_by": user.name,
        "accessed_by_role": user.role.role_name.value,
    }


@router.get("/system-info")
async def get_system_info(user: RequireSuperAdmin, db: DbSession):
    """Get system configuration and statistics.

    Requires: SUPER_ADMIN role only
    """
    from sqlalchemy import func, select

    from app.infrastructure.models.models import Role

    # Count users by role (single query with GROUP BY)
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
        "accessed_by": user.name,
    }


@router.get("/dashboard")
async def admin_dashboard(user: RequireAdmin, db: DbSession):
    """Get admin dashboard summary.

    Requires: ADMIN or SUPER_ADMIN role
    """
    from sqlalchemy import func, select
    from sqlalchemy.orm import selectinload

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
        "accessed_by": user.name,
        "user_role": user.role.role_name.value,
    }
