"""
Autoflow — SQLAlchemy Models
Workshop Management System — complete ORM layer.

Requirements:
    pip install sqlalchemy psycopg2-binary

Usage:
    from autoflow.models import Base
    from sqlalchemy import create_engine
    engine = create_engine("postgresql://user:password@localhost/autoflow")
    Base.metadata.create_all(engine)
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.base import (
    Base,
    MediaType,
    NotificationTrigger,
    NotificationType,
    OrderStatus,
    PartAvailability,
    PaymentMethod,
    QCResult,
    QuotationStatus,
    StepStatus,
    TickBy,
    UserRole,
    WorkflowStatus,
)

# ──────────────────────────────────────────────
# helpers
# ──────────────────────────────────────────────

def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.utcnow()


# ──────────────────────────────────────────────
# 1. ROLES
# ──────────────────────────────────────────────

class Role(Base):
    """
    Static role definitions.
    Values: super_admin | admin | bay
    """
    __tablename__ = "roles"

    role_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    role_name: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"), unique=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="role")

    def __repr__(self) -> str:
        return f"<Role {self.role_name}>"


# ──────────────────────────────────────────────
# 2. USERS
# ──────────────────────────────────────────────

class User(Base):
    """
    All system users.
    SA (Service Advisor) shares the bay/mechanic login — no separate role.
    Finance totals are hidden from admin & bay (enforced at API/service layer).
    """
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(150), unique=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(Text)
    role_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("roles.role_id")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=_now, server_default=func.now()
    )

    # relationships
    role: Mapped["Role"] = relationship("Role", back_populates="users")

    def __repr__(self) -> str:
        return f"<User {self.name} ({self.role_id})>"


# ──────────────────────────────────────────────
# 3. CUSTOMERS
# ──────────────────────────────────────────────

class Customer(Base):
    """Vehicle owner / customer details."""
    __tablename__ = "customers"

    customer_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    workflows: Mapped[list["Workflow"]] = relationship(
        "Workflow", back_populates="customer"
    )

    def __repr__(self) -> str:
        return f"<Customer {self.name}>"


# ──────────────────────────────────────────────
# 4. WORKFLOW STEP DEFINITIONS (template)
# ──────────────────────────────────────────────

class WorkflowStepDefinition(Base):
    """
    Master ordered list of all 22 steps.
    This is a static reference table — do not mutate at runtime.
    """
    __tablename__ = "workflow_step_definitions"

    step_def_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    step_number: Mapped[int] = mapped_column(Integer, unique=True)
    step_name: Mapped[str] = mapped_column(String(100))
    tick_by: Mapped[TickBy] = mapped_column(SAEnum(TickBy, name="tick_by"))
    notification_trigger: Mapped[NotificationTrigger] = mapped_column(
        SAEnum(NotificationTrigger, name="notification_trigger")
    )
    # Minutes to wait before triggering next-step notification (0 = immediate)
    notification_delay_min: Mapped[int] = mapped_column(Integer, default=0)
    is_auto_tick: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # relationships
    step_instances: Mapped[list["WorkflowStep"]] = relationship(
        "WorkflowStep", back_populates="step_definition"
    )

    def __repr__(self) -> str:
        return f"<StepDef {self.step_number}: {self.step_name}>"


# ──────────────────────────────────────────────
# 5. WORKFLOWS (master record)
# ──────────────────────────────────────────────

class Workflow(Base):
    """
    One record per car visit.
    - unique_ref is generated on creation and embedded in Google Form / supplier message links.
    - Deletion only permitted by admin/super_admin while no step has progressed.
    - pdf_snapshot_url stores the final closed PDF (Step 22).
    """
    __tablename__ = "workflows"

    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    # Short human-readable reference used in messages & Google Forms
    unique_ref: Mapped[str] = mapped_column(String(20), unique=True)
    plate_number: Mapped[str] = mapped_column(String(20))
    customer_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("customers.customer_id"), nullable=True
    )
    car_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    mileage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    chassis_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Points to the currently active step
    current_step_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("workflow_steps.step_id"),
        nullable=True,
    )
    current_status: Mapped[WorkflowStatus] = mapped_column(
        SAEnum(WorkflowStatus, name="workflow_status"),
        default=WorkflowStatus.CREATED,
    )
    whatsapp_group_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    pdf_snapshot_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    # relationships
    customer: Mapped[Optional["Customer"]] = relationship(
        "Customer", back_populates="workflows"
    )
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    steps: Mapped[list["WorkflowStep"]] = relationship(
        "WorkflowStep",
        back_populates="workflow",
        foreign_keys="WorkflowStep.workflow_id",
        cascade="all, delete-orphan",
    )
    current_step: Mapped[Optional["WorkflowStep"]] = relationship(
        "WorkflowStep", foreign_keys=[current_step_id]
    )
    inspection_sheet: Mapped[Optional["InspectionSheet"]] = relationship(
        "InspectionSheet", back_populates="workflow", uselist=False
    )
    parts_needed: Mapped[list["WorkflowPartNeeded"]] = relationship(
        "WorkflowPartNeeded", back_populates="workflow", cascade="all, delete-orphan"
    )
    supplier_enquiries: Mapped[list["SupplierEnquiry"]] = relationship(
        "SupplierEnquiry", back_populates="workflow"
    )
    quotation: Mapped[Optional["Quotation"]] = relationship(
        "Quotation", back_populates="workflow", uselist=False
    )
    part_orders: Mapped[list["PartOrder"]] = relationship(
        "PartOrder", back_populates="workflow"
    )
    media_uploads: Mapped[list["MediaUpload"]] = relationship(
        "MediaUpload", back_populates="workflow"
    )
    qc_records: Mapped[list["QCRecord"]] = relationship(
        "QCRecord", back_populates="workflow"
    )
    payments: Mapped[list["Payment"]] = relationship(
        "Payment", back_populates="workflow"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="workflow"
    )

    def __repr__(self) -> str:
        return f"<Workflow {self.unique_ref} | {self.plate_number}>"


# ──────────────────────────────────────────────
# 6. WORKFLOW STEPS (per-workflow instances)
# ──────────────────────────────────────────────

class WorkflowStep(Base):
    """
    One row per step per workflow.
    Auto-ticked steps are set programmatically (e.g. after parts selection).
    """
    __tablename__ = "workflow_steps"
    __table_args__ = (
        UniqueConstraint("workflow_id", "step_def_id", name="uq_workflow_step"),
    )

    step_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("workflows.workflow_id", use_alter=True),
    )
    step_def_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("workflow_step_definitions.step_def_id"),
    )
    status: Mapped[StepStatus] = mapped_column(
        SAEnum(StepStatus, name="step_status"),
        default=StepStatus.PENDING,
    )
    ticked_by: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=True
    )
    ticked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # relationships
    workflow: Mapped["Workflow"] = relationship(
        "Workflow",
        back_populates="steps",
        foreign_keys=[workflow_id],
    )
    step_definition: Mapped["WorkflowStepDefinition"] = relationship(
        "WorkflowStepDefinition", back_populates="step_instances"
    )
    ticker: Mapped[Optional["User"]] = relationship("User", foreign_keys=[ticked_by])
    media_uploads: Mapped[list["MediaUpload"]] = relationship(
        "MediaUpload", back_populates="step"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="step"
    )

    def __repr__(self) -> str:
        return f"<WorkflowStep {self.step_def_id} | {self.status}>"


# ──────────────────────────────────────────────
# 7. INSPECTION SHEETS
# ──────────────────────────────────────────────

class InspectionSheet(Base):
    """
    Step 2 — Complaint capture & customer repair approval.
    Ticking this step signals the customer agreed for the car to be checked.
    """
    __tablename__ = "inspection_sheets"

    inspection_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("workflows.workflow_id"),
        unique=True,
    )
    complaint_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    customer_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    approved_by: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    workflow: Mapped["Workflow"] = relationship(
        "Workflow", back_populates="inspection_sheet"
    )
    approver: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[approved_by]
    )

    def __repr__(self) -> str:
        return f"<InspectionSheet workflow={self.workflow_id} approved={self.customer_approved}>"


# ──────────────────────────────────────────────
# 8. PART CATEGORIES
# ──────────────────────────────────────────────

class PartCategory(Base):
    """Editable groupings for the parts catalogue (engine, brake, etc.)."""
    __tablename__ = "part_categories"

    category_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    category_name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # relationships
    parts: Mapped[list["Part"]] = relationship("Part", back_populates="category")

    def __repr__(self) -> str:
        return f"<PartCategory {self.category_name}>"


# ──────────────────────────────────────────────
# 9. PARTS
# ──────────────────────────────────────────────

class Part(Base):
    """
    Master parts catalogue.
    Admin can add new parts when a bay mechanic requests an unlisted part.
    """
    __tablename__ = "parts"

    part_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    category_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("part_categories.category_id")
    )
    part_name: Mapped[str] = mapped_column(String(150))
    part_code: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    category: Mapped["PartCategory"] = relationship("PartCategory", back_populates="parts")
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    workflow_parts_needed: Mapped[list["WorkflowPartNeeded"]] = relationship(
        "WorkflowPartNeeded", back_populates="part"
    )
    supplier_prices: Mapped[list["SupplierPartPrice"]] = relationship(
        "SupplierPartPrice", back_populates="part"
    )
    quotation_line_items: Mapped[list["QuotationLineItem"]] = relationship(
        "QuotationLineItem", back_populates="part"
    )

    def __repr__(self) -> str:
        return f"<Part {self.part_code}: {self.part_name}>"


# ──────────────────────────────────────────────
# 10. WORKFLOW PARTS NEEDED
# ──────────────────────────────────────────────

class WorkflowPartNeeded(Base):
    """
    Step 8 — Mechanic selects required parts per job.
    Inserting rows here auto-ticks Step 7 (troubleshooting) and Step 8 (spare part needed).
    """
    __tablename__ = "workflow_parts_needed"

    needed_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflows.workflow_id")
    )
    part_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("parts.part_id")
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    selected_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    selected_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    workflow: Mapped["Workflow"] = relationship(
        "Workflow", back_populates="parts_needed"
    )
    part: Mapped["Part"] = relationship("Part", back_populates="workflow_parts_needed")
    selector: Mapped["User"] = relationship("User", foreign_keys=[selected_by])

    def __repr__(self) -> str:
        return (
            f"<WorkflowPartNeeded workflow={self.workflow_id} "
            f"part={self.part_id} qty={self.quantity}>"
        )


# ──────────────────────────────────────────────
# 11. SUPPLIERS
# ──────────────────────────────────────────────

class Supplier(Base):
    """Parts suppliers directory."""
    __tablename__ = "suppliers"

    supplier_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    supplier_name: Mapped[str] = mapped_column(String(150))
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    whatsapp_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # relationships
    enquiries: Mapped[list["SupplierEnquiry"]] = relationship(
        "SupplierEnquiry", back_populates="supplier"
    )
    part_orders: Mapped[list["PartOrder"]] = relationship(
        "PartOrder", back_populates="supplier"
    )

    def __repr__(self) -> str:
        return f"<Supplier {self.supplier_name}>"


# ──────────────────────────────────────────────
# 12. SUPPLIER ENQUIRIES
# ──────────────────────────────────────────────

class SupplierEnquiry(Base):
    """
    Step 9 (price/availability) — auto-generated messages sent to suppliers.
    Message auto-embeds unique_ref + car model from workflow.
    Cannot be created until Step 6 (Update Workflow) details are complete.
    """
    __tablename__ = "supplier_enquiries"

    enquiry_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflows.workflow_id")
    )
    supplier_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("suppliers.supplier_id")
    )
    message_text: Mapped[str] = mapped_column(Text)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )

    # relationships
    workflow: Mapped["Workflow"] = relationship(
        "Workflow", back_populates="supplier_enquiries"
    )
    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="enquiries")
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    part_prices: Mapped[list["SupplierPartPrice"]] = relationship(
        "SupplierPartPrice", back_populates="enquiry"
    )

    def __repr__(self) -> str:
        return f"<SupplierEnquiry workflow={self.workflow_id} supplier={self.supplier_id}>"


# ──────────────────────────────────────────────
# 13. SUPPLIER PART PRICES
# ──────────────────────────────────────────────

class SupplierPartPrice(Base):
    """
    Admin keys in prices returned by supplier via WhatsApp.
    Visible to admin (product/selling price only — not finance totals).
    """
    __tablename__ = "supplier_part_prices"

    price_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    enquiry_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("supplier_enquiries.enquiry_id")
    )
    part_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("parts.part_id")
    )
    cost_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    availability: Mapped[PartAvailability] = mapped_column(
        SAEnum(PartAvailability, name="part_availability"),
        default=PartAvailability.AVAILABLE,
    )
    keyed_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    keyed_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    enquiry: Mapped["SupplierEnquiry"] = relationship(
        "SupplierEnquiry", back_populates="part_prices"
    )
    part: Mapped["Part"] = relationship("Part", back_populates="supplier_prices")
    keyer: Mapped["User"] = relationship("User", foreign_keys=[keyed_by])

    def __repr__(self) -> str:
        return f"<SupplierPartPrice part={self.part_id} cost={self.cost_price}>"


# ──────────────────────────────────────────────
# 14. QUOTATIONS
# ──────────────────────────────────────────────

class Quotation(Base):
    """
    Step 10 (mark-up) + Step 12 (optional formal quotation) — selling prices & margin control.
    System blocks tick if profit_margin_pct < 60% unless margin_override = True.
    Auto-generates Google Form link on creation.
    """
    __tablename__ = "quotations"
    __table_args__ = (
        CheckConstraint(
            "margin_override = TRUE OR profit_margin_pct >= 60",
            name="ck_min_profit_margin",
        ),
    )

    quotation_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("workflows.workflow_id"),
        unique=True,
    )
    google_form_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    pdf_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_cost: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    total_selling: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    profit_margin_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    margin_override: Mapped[bool] = mapped_column(Boolean, default=False)
    override_by: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=True
    )
    status: Mapped[QuotationStatus] = mapped_column(
        SAEnum(QuotationStatus, name="quotation_status"),
        default=QuotationStatus.DRAFT,
    )
    sent_to_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="quotation")
    line_items: Mapped[list["QuotationLineItem"]] = relationship(
        "QuotationLineItem", back_populates="quotation", cascade="all, delete-orphan"
    )
    confirmations: Mapped[list["CustomerConfirmation"]] = relationship(
        "CustomerConfirmation", back_populates="quotation"
    )
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    overrider: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[override_by]
    )
    payments: Mapped[list["Payment"]] = relationship(
        "Payment", back_populates="quotation"
    )

    def __repr__(self) -> str:
        return (
            f"<Quotation workflow={self.workflow_id} "
            f"status={self.status} margin={self.profit_margin_pct}%>"
        )


# ──────────────────────────────────────────────
# 15. QUOTATION LINE ITEMS
# ──────────────────────────────────────────────

class QuotationLineItem(Base):
    """
    Individual parts/services within a quotation.
    customer_confirmed is set per-part when Google Form response is received.
    Confirmed parts are colour-highlighted in UI.
    """
    __tablename__ = "quotation_line_items"

    line_item_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    quotation_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("quotations.quotation_id")
    )
    part_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("parts.part_id"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    cost_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    selling_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    customer_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)

    # relationships
    quotation: Mapped["Quotation"] = relationship(
        "Quotation", back_populates="line_items"
    )
    part: Mapped[Optional["Part"]] = relationship(
        "Part", back_populates="quotation_line_items"
    )
    media_uploads: Mapped[list["MediaUpload"]] = relationship(
        "MediaUpload", back_populates="line_item"
    )

    def __repr__(self) -> str:
        return (
            f"<QuotationLineItem {self.description} "
            f"qty={self.quantity} confirmed={self.customer_confirmed}>"
        )


# ──────────────────────────────────────────────
# 16. CUSTOMER CONFIRMATIONS
# ──────────────────────────────────────────────

class CustomerConfirmation(Base):
    """
    Step 11 — Google Form submission captured by unique_ref.
    Receiving this record auto-ticks Step 11 and triggers immediate notification.
    """
    __tablename__ = "customer_confirmations"

    confirmation_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflows.workflow_id")
    )
    quotation_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("quotations.quotation_id")
    )
    # Raw Google Form response stored as JSON for auditability
    form_response_raw: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    quotation: Mapped["Quotation"] = relationship(
        "Quotation", back_populates="confirmations"
    )

    def __repr__(self) -> str:
        return f"<CustomerConfirmation workflow={self.workflow_id} received={self.received_at}>"


# ──────────────────────────────────────────────
# 17. PART ORDERS
# ──────────────────────────────────────────────

class PartOrder(Base):
    """
    Step 13 — Ordering confirmed parts from suppliers.
    Step 14 notification fires 15 min after ordered_at.
    Manual tick on receipt changes status → received and sets car status → work_progress.
    """
    __tablename__ = "part_orders"

    order_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflows.workflow_id")
    )
    supplier_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("suppliers.supplier_id")
    )
    order_message_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ordered_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    ordered_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    received_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    received_by: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=True
    )
    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus, name="order_status"),
        default=OrderStatus.ORDERED,
    )

    # relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="part_orders")
    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="part_orders")
    orderer: Mapped["User"] = relationship("User", foreign_keys=[ordered_by])
    receiver: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[received_by]
    )

    def __repr__(self) -> str:
        return f"<PartOrder workflow={self.workflow_id} status={self.status}>"


# ──────────────────────────────────────────────
# 18. MEDIA UPLOADS
# ──────────────────────────────────────────────

class MediaUpload(Base):
    """
    All photo uploads across Steps 4 (car body), 5 (chassis), and 16 (work progress).
    Step 16 photos are linked to quotation_line_items to track coverage per confirmed part.
    Step 17 (work complete) checks all confirmed parts have photos before allowing tick.
    """
    __tablename__ = "media_uploads"

    media_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflows.workflow_id")
    )
    step_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflow_steps.step_id")
    )
    # Nullable — only set for Step 16 work-progress photos
    line_item_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("quotation_line_items.line_item_id"),
        nullable=True,
    )
    media_type: Mapped[MediaType] = mapped_column(SAEnum(MediaType, name="media_type"))
    file_url: Mapped[str] = mapped_column(Text)
    uploaded_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    workflow: Mapped["Workflow"] = relationship(
        "Workflow", back_populates="media_uploads"
    )
    step: Mapped["WorkflowStep"] = relationship(
        "WorkflowStep", back_populates="media_uploads"
    )
    line_item: Mapped[Optional["QuotationLineItem"]] = relationship(
        "QuotationLineItem", back_populates="media_uploads"
    )
    uploader: Mapped["User"] = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self) -> str:
        return f"<MediaUpload {self.media_type} workflow={self.workflow_id}>"


# ──────────────────────────────────────────────
# 19. QC RECORDS
# ──────────────────────────────────────────────

class QCRecord(Base):
    """Step 18 — Quality control check log."""
    __tablename__ = "qc_records"

    qc_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflows.workflow_id")
    )
    checked_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    result: Mapped[QCResult] = mapped_column(SAEnum(QCResult, name="qc_result"))
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    checked_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="qc_records")
    checker: Mapped["User"] = relationship("User", foreign_keys=[checked_by])

    def __repr__(self) -> str:
        return f"<QCRecord workflow={self.workflow_id} result={self.result}>"


# ──────────────────────────────────────────────
# 20. NOTIFICATIONS
# ──────────────────────────────────────────────

class Notification(Base):
    """
    All system-triggered alerts.
    - ALARM type (Step 6) is snooze-able multiple times via snooze_count / snoozed_until.
    - BOSS_ALERT escalates when a snoozed alarm is ignored past threshold.
    - REMINDER fires after a configurable delay (e.g. 15 min after part order).
    """
    __tablename__ = "notifications"

    notification_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflows.workflow_id"), nullable=True
    )
    step_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflow_steps.step_id"), nullable=True
    )
    recipient_role: Mapped[str | None] = mapped_column(String(50), nullable=True)
    recipient_user_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=True
    )
    type: Mapped[NotificationType] = mapped_column(
        SAEnum(NotificationType, name="notification_type")
    )
    message: Mapped[str] = mapped_column(Text)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    snooze_count: Mapped[int] = mapped_column(Integer, default=0)
    snoozed_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # relationships
    workflow: Mapped[Optional["Workflow"]] = relationship(
        "Workflow", back_populates="notifications"
    )
    step: Mapped[Optional["WorkflowStep"]] = relationship(
        "WorkflowStep", back_populates="notifications"
    )
    recipient: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[recipient_user_id]
    )

    def __repr__(self) -> str:
        return f"<Notification {self.type} workflow={self.workflow_id} read={self.is_read}>"


# ──────────────────────────────────────────────
# 21. PAYMENTS
# ──────────────────────────────────────────────

class Payment(Base):
    """Step 21 — Payment receipt and tracking."""
    __tablename__ = "payments"

    payment_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    workflow_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("workflows.workflow_id")
    )
    quotation_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("quotations.quotation_id")
    )
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    payment_method: Mapped[PaymentMethod] = mapped_column(
        SAEnum(PaymentMethod, name="payment_method")
    )
    receipt_pdf_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    received_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.user_id")
    )
    received_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    # relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="payments")
    quotation: Mapped["Quotation"] = relationship("Quotation", back_populates="payments")
    receiver: Mapped["User"] = relationship("User", foreign_keys=[received_by])

    def __repr__(self) -> str:
        return (
            f"<Payment workflow={self.workflow_id} "
            f"amount={self.amount_paid} method={self.payment_method}>"
        )
