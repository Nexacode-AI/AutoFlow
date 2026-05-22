"""Database seed — reference data the whole system depends on.

Seeds three things, idempotently (safe to re-run):
  1. Roles            — super_admin / admin / bay
  2. Step definitions — the master ordered list of the 20 workflow steps
  3. A starter super-admin user — so the team can log in immediately

Run:  python -m app.infrastructure.seed

NOTE for P1: the tick_by / notification rules below are sensible defaults
drawn from the workflow spec. Verify and adjust them when building the
workflow engine.
"""
import asyncio
import logging

from sqlalchemy import select

from app.core.security import hash_password
from app.infrastructure.base import NotificationTrigger, TickBy, UserRole
from app.infrastructure.models.models import Role, User, WorkflowStepDefinition
from app.infrastructure.session import AsyncSessionLocal, init_db

logger = logging.getLogger(__name__)

# Default starter account — change the password after first login.
ADMIN_EMAIL = "admin@autoflow.local"
ADMIN_PASSWORD = "admin123"

ROLES = [
    (UserRole.SUPER_ADMIN, "Full system access"),
    (UserRole.ADMIN, "Administrative functions"),
    (UserRole.BAY, "Mechanic / service advisor (shared login)"),
]

# (number, name, tick_by, notification_trigger, delay_min, is_auto_tick)
STEP_DEFINITIONS = [
    (1,  "Create Workflow",          TickBy.BAY,   NotificationTrigger.IMMEDIATE, 0,  False),
    (2,  "Inspection Sheet",         TickBy.BAY,   NotificationTrigger.IMMEDIATE, 0,  False),
    (3,  "WhatsApp Group",           TickBy.BAY,   NotificationTrigger.IMMEDIATE, 0,  False),
    (4,  "Vehicle Photos",           TickBy.BAY,   NotificationTrigger.IMMEDIATE, 0,  False),
    (5,  "Update Customer Details",  TickBy.ADMIN, NotificationTrigger.NONE,      0,  False),
    (6,  "Troubleshooting",          TickBy.AUTO,  NotificationTrigger.IMMEDIATE, 0,  True),
    (7,  "Spare Parts Needed",       TickBy.AUTO,  NotificationTrigger.IMMEDIATE, 0,  True),
    (8,  "Spare Part Price",         TickBy.ADMIN, NotificationTrigger.IMMEDIATE, 0,  False),
    (9,  "Mark Up",                  TickBy.ADMIN, NotificationTrigger.DELAYED,   10, False),
    (10, "Spare Part Confirmation",  TickBy.AUTO,  NotificationTrigger.IMMEDIATE, 0,  True),
    (11, "Quotation",                TickBy.ADMIN, NotificationTrigger.IMMEDIATE, 0,  False),
    (12, "Spare Part Order",         TickBy.ADMIN, NotificationTrigger.DELAYED,   15, False),
    (13, "Spare Parts Received",     TickBy.BAY,   NotificationTrigger.IMMEDIATE, 0,  False),
    (14, "Work Progress & Complete", TickBy.BAY,   NotificationTrigger.IMMEDIATE, 0,  False),
    (15, "Quality Control",          TickBy.BAY,   NotificationTrigger.IMMEDIATE, 0,  False),
    (16, "Car Wash",                 TickBy.BAY,   NotificationTrigger.IMMEDIATE, 0,  False),
    (17, "Send Receipt",             TickBy.ADMIN, NotificationTrigger.DELAYED,   15, False),
    (18, "Receive Payment",          TickBy.ADMIN, NotificationTrigger.IMMEDIATE, 0,  False),
    (19, "Car Delivery",             TickBy.ADMIN, NotificationTrigger.IMMEDIATE, 0,  False),
    (20, "Customer Feedback",        TickBy.NONE,  NotificationTrigger.NONE,      0,  False),
]


async def seed() -> None:
    await init_db()

    async with AsyncSessionLocal() as db:
        # ── Roles ──
        for role_name, description in ROLES:
            exists = await db.scalar(
                select(Role).where(Role.role_name == role_name)
            )
            if not exists:
                db.add(Role(role_name=role_name, description=description))
                logger.info("+ role: %s", role_name.value)
        await db.flush()

        # ── Step definitions ──
        for num, name, tick_by, trigger, delay, auto in STEP_DEFINITIONS:
            exists = await db.scalar(
                select(WorkflowStepDefinition).where(
                    WorkflowStepDefinition.step_number == num
                )
            )
            if not exists:
                db.add(
                    WorkflowStepDefinition(
                        step_number=num,
                        step_name=name,
                        tick_by=tick_by,
                        notification_trigger=trigger,
                        notification_delay_min=delay,
                        is_auto_tick=auto,
                    )
                )
                logger.info("+ step %02d: %s", num, name)

        # ── Starter super-admin ──
        admin = await db.scalar(select(User).where(User.email == ADMIN_EMAIL))
        if not admin:
            super_role = await db.scalar(
                select(Role).where(Role.role_name == UserRole.SUPER_ADMIN)
            )
            db.add(
                User(
                    name="System Admin",
                    email=ADMIN_EMAIL,
                    password_hash=hash_password(ADMIN_PASSWORD),
                    role_id=super_role.role_id,
                )
            )
            logger.info("+ user: %s (password: %s)", ADMIN_EMAIL, ADMIN_PASSWORD)

        await db.commit()

    logger.info("✓ Seed complete")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    asyncio.run(seed())
