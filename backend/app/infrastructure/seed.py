"""
Database seed script — idempotent.

Seeds:
  1. Three roles (super_admin, admin, bay)
  2. Twenty-two workflow step definitions
  3. One default super_admin user (admin@autoflow.local / Admin@123)

Safe to run on every startup — uses INSERT ... ON CONFLICT DO NOTHING.
"""
import logging
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from app.infrastructure.base import (
    NotificationTrigger,
    TickBy,
    UserRole,
)
from app.infrastructure.models.models import (
    Role,
    User,
    WorkflowStepDefinition,
)

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── 22 workflow step definitions (matches client spec) ──────────────
# tick_by convention:
#   bay   = bay, admin, super_admin can all tick
#   admin = admin, super_admin can tick
#   auto  = system auto-ticks (parts selection, google form, etc.)
#   none  = no manual tick at this step

STEP_DEFINITIONS: list[dict] = [
    {
        "step_number": 1,
        "step_name": "Create Workflow",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Bay team creates workflow using car plate number upon vehicle arrival.",
    },
    {
        "step_number": 2,
        "step_name": "Inspection / Complaint / Repair Approval",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "SA ticks once customer agrees for car to be checked.",
    },
    {
        "step_number": 3,
        "step_name": "WhatsApp Group",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Bay creates the WhatsApp group for this job.",
    },
    {
        "step_number": 4,
        "step_name": "Car Body Photo",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Bay takes car body photos and uploads to group.",
    },
    {
        "step_number": 5,
        "step_name": "Chassis No Photo",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Bay takes chassis number photo. After tick, status → Troubleshooting.",
    },
    {
        "step_number": 6,
        "step_name": "Update Workflow (Customer Details)",
        "tick_by": TickBy.ADMIN,
        "notification_trigger": NotificationTrigger.NONE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Admin fills name, phone, car model, mileage, chassis. Alarm triggers; no status change.",
    },
    {
        "step_number": 7,
        "step_name": "Troubleshooting",
        "tick_by": TickBy.AUTO,
        "notification_trigger": NotificationTrigger.NONE,
        "notification_delay_min": 0,
        "is_auto_tick": True,
        "description": "Auto-ticked when bay selects spare parts. Status remains Troubleshooting.",
    },
    {
        "step_number": 8,
        "step_name": "Spare Part Needed",
        "tick_by": TickBy.AUTO,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": True,
        "description": "Mechanic selects parts by category. Auto-ticked after selection.",
    },
    {
        "step_number": 9,
        "step_name": "Spare Part Price / Availability",
        "tick_by": TickBy.ADMIN,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Admin creates supplier enquiry messages, keys in returned prices.",
    },
    {
        "step_number": 10,
        "step_name": "Mark Up",
        "tick_by": TickBy.ADMIN,
        "notification_trigger": NotificationTrigger.DELAYED,
        "notification_delay_min": 10,
        "is_auto_tick": False,
        "description": "Admin sets selling prices. Blocked if profit margin < 60%% unless overridden. Creates Google Form link.",
    },
    {
        "step_number": 11,
        "step_name": "Spare Part Confirmation to Owner",
        "tick_by": TickBy.AUTO,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": True,
        "description": "Auto-ticked when Google Form response is received. Generates receipt.",
    },
    {
        "step_number": 12,
        "step_name": "Quotation",
        "tick_by": TickBy.ADMIN,
        "notification_trigger": NotificationTrigger.NONE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Optional. If ticked, formal quotation PDF is created. Can skip to next step.",
    },
    {
        "step_number": 13,
        "step_name": "Spare Part Order",
        "tick_by": TickBy.ADMIN,
        "notification_trigger": NotificationTrigger.DELAYED,
        "notification_delay_min": 15,
        "is_auto_tick": False,
        "description": "Admin generates order message for suppliers. Notification after 15 min.",
    },
    {
        "step_number": 14,
        "step_name": "Spare Part in Workshop",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Bay/admin ticks on receipt. Activates upload button. Status → Work Progress.",
    },
    {
        "step_number": 15,
        "step_name": "Work Progress",
        "tick_by": TickBy.NONE,
        "notification_trigger": NotificationTrigger.NONE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Status display only. No tick at this step.",
    },
    {
        "step_number": 16,
        "step_name": "Work Progress Photo",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.NONE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Mechanic uploads photos: after removal, old part, new part, after fixed — per confirmed line item.",
    },
    {
        "step_number": 17,
        "step_name": "Work Complete",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Bay ticks. Warns if photos incomplete. Triggers QC notification.",
    },
    {
        "step_number": 18,
        "step_name": "QC",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Bay performs quality check (pass/fail).",
    },
    {
        "step_number": 19,
        "step_name": "Car Wash",
        "tick_by": TickBy.BAY,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Bay or admin ticks once car wash done.",
    },
    {
        "step_number": 20,
        "step_name": "Send Receipt to Customer",
        "tick_by": TickBy.ADMIN,
        "notification_trigger": NotificationTrigger.DELAYED,
        "notification_delay_min": 15,
        "is_auto_tick": False,
        "description": "Admin sends PDF/hardcopy receipt. Print and send buttons available.",
    },
    {
        "step_number": 21,
        "step_name": "Receive Payment",
        "tick_by": TickBy.ADMIN,
        "notification_trigger": NotificationTrigger.IMMEDIATE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Admin ticks once payment received.",
    },
    {
        "step_number": 22,
        "step_name": "Car Deliver",
        "tick_by": TickBy.ADMIN,
        "notification_trigger": NotificationTrigger.NONE,
        "notification_delay_min": 0,
        "is_auto_tick": False,
        "description": "Admin ticks. Workflow auto-closed and saved as PDF.",
    },
]


async def seed_roles(session: AsyncSession) -> dict[UserRole, str]:
    """Insert roles if they don't exist. Returns {UserRole: role_id} map."""
    role_map: dict[UserRole, str] = {}
    for role_enum in UserRole:
        result = await session.execute(
            select(Role).where(Role.role_name == role_enum)
        )
        role = result.scalar_one_or_none()
        if role is None:
            role = Role(role_name=role_enum, description=f"{role_enum.value} role")
            session.add(role)
            await session.flush()
            logger.info(f"  Seeded role: {role_enum.value}")
        role_map[role_enum] = role.role_id
    return role_map


async def seed_step_definitions(session: AsyncSession) -> None:
    """Insert the 22 workflow step definitions if they don't exist."""
    for step_data in STEP_DEFINITIONS:
        result = await session.execute(
            select(WorkflowStepDefinition).where(
                WorkflowStepDefinition.step_number == step_data["step_number"]
            )
        )
        existing = result.scalar_one_or_none()
        if existing is None:
            step_def = WorkflowStepDefinition(**step_data)
            session.add(step_def)
            logger.info(f"  Seeded step {step_data['step_number']}: {step_data['step_name']}")


async def seed_default_super_admin(
    session: AsyncSession, role_map: dict[UserRole, str]
) -> None:
    """Create a default super_admin user if none exists."""
    result = await session.execute(
        select(User).join(Role).where(Role.role_name == UserRole.SUPER_ADMIN)
    )
    if result.scalar_one_or_none() is not None:
        return

    admin = User(
        name="Super Admin",
        email="admin@autoflow.com",
        phone="0000000000",
        password_hash=pwd_context.hash("Admin@123"),
        role_id=role_map[UserRole.SUPER_ADMIN],
        is_active=True,
    )
    session.add(admin)
    logger.info("  Seeded default super_admin (admin@autoflow.com / Admin@123)")


async def run_seed(session: AsyncSession) -> None:
    """Run all seed operations inside one transaction."""
    logger.info("▶ Running database seed...")
    role_map = await seed_roles(session)
    await seed_step_definitions(session)
    await seed_default_super_admin(session, role_map)
    await session.commit()
    logger.info("✓ Database seed complete.")
