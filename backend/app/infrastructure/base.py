from sqlalchemy.orm import declarative_base
import enum

Base = declarative_base()

# ──────────────────────────────────────────────
# Users & Roles
# ──────────────────────────────────────────────

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    BAY = "bay"  # mechanic / service advisor (shared login)


# ──────────────────────────────────────────────
# Workflow Steps
# ──────────────────────────────────────────────

class TickBy(str, enum.Enum):
    ADMIN = "admin"
    BAY = "bay"
    AUTO = "auto"
    NONE = "none"


class NotificationTrigger(str, enum.Enum):
    IMMEDIATE = "immediate"
    DELAYED = "delayed"
    NONE = "none"


class WorkflowStatus(str, enum.Enum):
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


class StepStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    SKIPPED = "skipped"


# ──────────────────────────────────────────────
# Parts & Orders
# ──────────────────────────────────────────────

class PartAvailability(str, enum.Enum):
    AVAILABLE = "available"
    ON_ORDER = "on_order"
    UNAVAILABLE = "unavailable"


class OrderStatus(str, enum.Enum):
    ORDERED = "ordered"
    RECEIVED = "received"


# ──────────────────────────────────────────────
# Quotation
# ──────────────────────────────────────────────

class QuotationStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


# ──────────────────────────────────────────────
# Media
# ──────────────────────────────────────────────

class MediaType(str, enum.Enum):
    CAR_BODY = "car_body"
    CHASSIS = "chassis"
    AFTER_REMOVAL = "after_removal"
    OLD_PART = "old_part"
    NEW_PART = "new_part"
    AFTER_FIXED = "after_fixed"


# ──────────────────────────────────────────────
# QC
# ──────────────────────────────────────────────

class QCResult(str, enum.Enum):
    PASS = "pass"
    FAIL = "fail"


# ──────────────────────────────────────────────
# Notifications
# ──────────────────────────────────────────────

class NotificationType(str, enum.Enum):
    STEP_COMPLETE = "step_complete"
    ALARM = "alarm"           # snooze-able (e.g. Step 6 reminder)
    REMINDER = "reminder"     # delayed follow-up (e.g. 15-min after order)
    BOSS_ALERT = "boss_alert" # escalated when alarm ignored


# ──────────────────────────────────────────────
# Payments
# ──────────────────────────────────────────────

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"
    OTHER = "other"