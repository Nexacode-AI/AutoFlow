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
from app.infrastructure.base import NotificationTrigger, PartGrade, TickBy, UserRole
from app.infrastructure.models.models import (
    PartCategory,
    PartsCatalogue,
    Role,
    Supplier,
    User,
    WorkflowStepDefinition,
)
from app.infrastructure.session import AsyncSessionLocal, init_db

logger = logging.getLogger(__name__)

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

        # ── Starter accounts (one per role) ──
        SEED_USERS = [
            ("System Admin",    "admin@autoflow.local", "admin123",  UserRole.SUPER_ADMIN),
            ("Workshop Admin",  "admin2@autoflow.local", "admin123",     UserRole.ADMIN),
            ("Bay Team",        "bay@autoflow.local",    "bay123",       UserRole.BAY),
        ]
        for full_name, email, password, role_name in SEED_USERS:
            exists = await db.scalar(select(User).where(User.email == email))
            if not exists:
                role_row = await db.scalar(
                    select(Role).where(Role.role_name == role_name)
                )
                db.add(
                    User(
                        name=full_name,
                        email=email,
                        password_hash=hash_password(password),
                        role_id=role_row.role_id,
                    )
                )
                logger.info("+ user: %s / %s  (role: %s)", email, password, role_name.value)

        await db.flush()

        # ── Parts catalogue — categories ──
        CATALOGUE_CATEGORIES = [
            ("Brakes",      "Brake pads, discs, calipers and hydraulics",          "🛑", 1),
            ("Engine",      "Engine internals, gaskets, belts and filters",         "⚙️",  2),
            ("Electrical",  "Batteries, alternators, sensors and wiring",           "⚡", 3),
            ("AC",          "Air-conditioning compressors, gas and components",     "❄️",  4),
            ("Suspension",  "Shock absorbers, struts, bushings and ball joints",    "🔩", 5),
            ("Transmission","Gearbox, clutch and drivetrain components",            "🔧", 6),
            ("Tyres",       "Tyres and wheel/rim related parts",                    "🔵", 7),
            ("Lighting",    "Headlights, taillights, bulbs and indicators",         "💡", 8),
        ]
        category_ids: dict[str, str] = {}
        for cat_name, cat_desc, cat_icon, cat_order in CATALOGUE_CATEGORIES:
            cat = await db.scalar(
                select(PartCategory).where(PartCategory.category_name == cat_name)
            )
            if not cat:
                cat = PartCategory(
                    category_name=cat_name,
                    description=cat_desc,
                    icon=cat_icon,
                    sort_order=cat_order,
                )
                db.add(cat)
                await db.flush()
                logger.info("+ catalogue category: %s", cat_name)
            category_ids[cat_name] = cat.category_id

        # ── Parts catalogue — sample parts ──
        # (category_name, part_name, grade, warranty_months)
        CATALOGUE_PARTS = [
            ("Brakes", "Brake Pad Set (Front)",    PartGrade.ORI, 12),
            ("Brakes", "Brake Pad Set (Front)",    PartGrade.OM,   6),
            ("Brakes", "Brake Pad Set (Rear)",     PartGrade.ORI, 12),
            ("Brakes", "Brake Pad Set (Rear)",     PartGrade.OM,   6),
            ("Brakes", "Brake Disc (Front)",       PartGrade.ORI, 12),
            ("Brakes", "Brake Disc (Rear)",        PartGrade.ORI, 12),
            ("Brakes", "Brake Fluid DOT 4",        PartGrade.OM,   6),
            ("Engine", "Engine Oil Filter",        PartGrade.ORI, 12),
            ("Engine", "Engine Oil Filter",        PartGrade.OM,   6),
            ("Engine", "Air Filter",               PartGrade.ORI, 12),
            ("Engine", "Air Filter",               PartGrade.OM,   6),
            ("Engine", "Timing Belt Kit",          PartGrade.ORI, 12),
            ("Engine", "Spark Plug (set of 4)",    PartGrade.ORI, 12),
            ("Engine", "Spark Plug (set of 4)",    PartGrade.OM,   6),
            ("Engine", "Radiator Hose (Upper)",    PartGrade.ORI, 12),
            ("Electrical", "Car Battery 55Ah",     PartGrade.ORI, 24),
            ("Electrical", "Car Battery 55Ah",     PartGrade.OM,  12),
            ("Electrical", "Alternator",           PartGrade.ORI, 12),
            ("Electrical", "Starter Motor",        PartGrade.ORI, 12),
            ("AC", "AC Compressor",                PartGrade.ORI, 12),
            ("AC", "AC Compressor",                PartGrade.OM,   6),
            ("AC", "AC Gas R134a (Refill)",        PartGrade.OM,   3),
            ("AC", "AC Cabin Filter",              PartGrade.ORI, 12),
            ("AC", "AC Cabin Filter",              PartGrade.OM,   6),
            ("Suspension", "Front Shock Absorber", PartGrade.ORI, 12),
            ("Suspension", "Front Shock Absorber", PartGrade.OM,   6),
            ("Suspension", "Rear Shock Absorber",  PartGrade.ORI, 12),
            ("Suspension", "Rear Shock Absorber",  PartGrade.OM,   6),
            ("Suspension", "Front Lower Ball Joint", PartGrade.ORI, 12),
            ("Suspension", "Stabiliser Link",      PartGrade.OM,   6),
        ]
        for cat_name, part_name, grade, warranty in CATALOGUE_PARTS:
            cat_id = category_ids.get(cat_name)
            if not cat_id:
                continue
            exists = await db.scalar(
                select(PartsCatalogue).where(
                    PartsCatalogue.category_id == cat_id,
                    PartsCatalogue.name == part_name,
                    PartsCatalogue.grade == grade,
                )
            )
            if not exists:
                db.add(PartsCatalogue(
                    category_id=cat_id,
                    name=part_name,
                    grade=grade,
                    warranty_months=warranty,
                ))
                logger.info("+ catalogue part: %s (%s)", part_name, grade.value)

        # ── Suppliers ──
        SEED_SUPPLIERS = [
            {
                "supplier_name": "Suan Huat Auto Parts",
                "phone": "0123456789",
                "whatsapp_number": "60123456789",
                "email": "suanhuat@example.com",
                "notes": "Best pricing for brakes and electrical. Cash on delivery.",
            },
            {
                "supplier_name": "Stuttgart Auto",
                "phone": "0198765432",
                "whatsapp_number": "60198765432",
                "email": "stuttgart@example.com",
                "notes": "ORI parts specialist. 1–2 day lead time for engine components.",
            },
            {
                "supplier_name": "Bavaria Motor Parts",
                "phone": "0187654321",
                "whatsapp_number": "60187654321",
                "email": "bavaria@example.com",
                "notes": "Good for AC and suspension. Accepts 30-day credit terms.",
            },
        ]
        for s in SEED_SUPPLIERS:
            exists = await db.scalar(
                select(Supplier).where(Supplier.supplier_name == s["supplier_name"])
            )
            if not exists:
                db.add(Supplier(**s))
                logger.info("+ supplier: %s", s["supplier_name"])

        await db.commit()

    logger.info("✓ Seed complete")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    asyncio.run(seed())
