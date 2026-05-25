import enum

from sqlalchemy.orm import declarative_base

Base = declarative_base()

# ──────────────────────────────────────────────
# Users & Roles
# ──────────────────────────────────────────────

class UserRole(enum.StrEnum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    BAY = "bay"  # mechanic / service advisor (shared login)


# ──────────────────────────────────────────────
# Workflow Steps
# ──────────────────────────────────────────────

class TickBy(enum.StrEnum):
    ADMIN = "admin"
    BAY = "bay"
    AUTO = "auto"
    NONE = "none"


class NotificationTrigger(enum.StrEnum):
    IMMEDIATE = "immediate"
    DELAYED = "delayed"
    NONE = "none"


class WorkflowStatus(enum.StrEnum):
    CREATED = "created"
    INSPECTION = "inspection"
    TROUBLESHOOTING = "troubleshooting"
    WORK_PROGRESS = "work_progress"
    WORK_COMPLETE = "work_complete"
    QC = "qc"
    CAR_WASH = "car_wash"
    AWAITING_PAYMENT = "awaiting_payment"
    COMPLETED = "completed"
    DELETED = "deleted"


class StepStatus(enum.StrEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    SKIPPED = "skipped"


# ──────────────────────────────────────────────
# Parts & Orders
# ──────────────────────────────────────────────

class PartAvailability(enum.StrEnum):
    AVAILABLE = "available"
    ON_ORDER = "on_order"
    UNAVAILABLE = "unavailable"


class OrderStatus(enum.StrEnum):
    ORDERED = "ordered"
    RECEIVED = "received"


# ──────────────────────────────────────────────
# Quotation
# ──────────────────────────────────────────────

class QuotationStatus(enum.StrEnum):
    DRAFT = "draft"
    SENT = "sent"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


# ──────────────────────────────────────────────
# Media
# ──────────────────────────────────────────────

class MediaType(enum.StrEnum):
    CAR_BODY = "car_body"
    CHASSIS = "chassis"
    AFTER_REMOVAL = "after_removal"
    OLD_PART = "old_part"
    NEW_PART = "new_part"
    AFTER_FIXED = "after_fixed"


# ──────────────────────────────────────────────
# QC
# ──────────────────────────────────────────────

class QCResult(enum.StrEnum):
    PASS = "pass"
    FAIL = "fail"


# ──────────────────────────────────────────────
# Notifications
# ──────────────────────────────────────────────

class NotificationType(enum.StrEnum):
    STEP_COMPLETE = "step_complete"
    ALARM = "alarm"           # snooze-able (e.g. Step 6 reminder)
    REMINDER = "reminder"     # delayed follow-up (e.g. 15-min after order)
    BOSS_ALERT = "boss_alert" # escalated when alarm ignored


# ──────────────────────────────────────────────
# Payments
# ──────────────────────────────────────────────

class PaymentMethod(enum.StrEnum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"
    OTHER = "other"


# ──────────────────────────────────────────────
# Personal Expenses (Issue #20)
# ──────────────────────────────────────────────

class PersonalExpenseCategory(enum.StrEnum):
    FUEL_TRANSPORT = "fuel_transport"
    UTILITIES = "utilities"
    MEALS_ENTERTAINMENT = "meals_entertainment"
    OFFICE_STATIONERY = "office_stationery"
    TRAINING_DEVELOPMENT = "training_development"
    MARKETING_ADVERTISING = "marketing_advertising"
    EQUIPMENT_MAINTENANCE = "equipment_maintenance"
    OTHERS = "others"


class BankStatementStatus(enum.StrEnum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
