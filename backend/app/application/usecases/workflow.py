"""Workflow use cases — create, list, detail, update, delete, step completion."""
import secrets
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dto.workflow import (
    CompleteStepRequest,
    CreateWorkflowRequest,
    UpdateWorkflowDetailsRequest,
    WorkflowDetailResponse,
    WorkflowDetailsResponse,
    WorkflowListResponse,
    WorkflowResponse,
    WorkflowStepResponse,
)
from app.infrastructure.base import (
    StepStatus,
    TickBy,
    UserRole,
    WorkflowStatus,
)
from app.infrastructure.models.models import (
    Customer,
    User,
    Workflow,
    WorkflowStep,
    WorkflowStepDefinition,
)


# ── After completing step N, the workflow status becomes this ────────
STEP_TO_WORKFLOW_STATUS: dict[int, Optional[WorkflowStatus]] = {
    1: WorkflowStatus.CREATED,
    2: WorkflowStatus.INSPECTION,
    3: WorkflowStatus.INSPECTION,
    4: WorkflowStatus.INSPECTION,
    5: WorkflowStatus.TROUBLESHOOTING,
    6: None,  # Step 6: no status change (per spec)
    7: WorkflowStatus.TROUBLESHOOTING,
    8: WorkflowStatus.TROUBLESHOOTING,
    9: WorkflowStatus.TROUBLESHOOTING,
    10: WorkflowStatus.TROUBLESHOOTING,
    11: WorkflowStatus.TROUBLESHOOTING,
    12: WorkflowStatus.TROUBLESHOOTING,
    13: WorkflowStatus.TROUBLESHOOTING,
    14: WorkflowStatus.WORK_PROGRESS,
    15: WorkflowStatus.WORK_PROGRESS,
    16: WorkflowStatus.WORK_PROGRESS,
    17: WorkflowStatus.WORK_COMPLETE,
    18: WorkflowStatus.QC,
    19: WorkflowStatus.CAR_WASH,
    20: WorkflowStatus.AWAITING_PAYMENT,
    21: WorkflowStatus.AWAITING_PAYMENT,
    22: WorkflowStatus.COMPLETED,
}

# Role permission mapping: which roles can tick which tick_by type
TICK_BY_ALLOWED_ROLES: dict[TickBy, list[UserRole]] = {
    TickBy.BAY: [UserRole.BAY, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    TickBy.ADMIN: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    TickBy.AUTO: [],   # No manual ticking
    TickBy.NONE: [],   # No ticking at all
}

# Step 6 can be done independently of sequential order
INDEPENDENT_STEPS = {6}

# Step 12 (Quotation) is optional — can be skipped
SKIPPABLE_STEPS = {12}

# Step 15 (Work Progress) is status-display only — never "completed"
NO_TICK_STEPS = {15}


# ── Helpers ──────────────────────────────────────


def _generate_unique_ref() -> str:
    """Generate a short unique reference like AF-A1B2C3."""
    return f"AF-{secrets.token_hex(3).upper()}"


def _build_step_response(
    step: WorkflowStep,
    step_def: WorkflowStepDefinition,
) -> WorkflowStepResponse:
    return WorkflowStepResponse(
        id=step.step_id,
        workflow_id=step.workflow_id,
        step_number=step_def.step_number,
        step_name=step_def.step_name,
        status=step.status.value,
        completed_at=step.ticked_at,
        completed_by=step.ticked_by,
        notes=step.notes,
    )


def _get_current_step_number(workflow: Workflow) -> Optional[int]:
    """Derive current step number from the workflow's current_step relationship."""
    if workflow.current_step and workflow.current_step.step_definition:
        return workflow.current_step.step_definition.step_number
    return None


def _build_workflow_response(
    workflow: Workflow,
    current_step_number: Optional[int] = None,
) -> WorkflowResponse:
    customer_name = None
    contact_number = None
    if workflow.customer:
        customer_name = workflow.customer.name
        contact_number = workflow.customer.phone

    details = WorkflowDetailsResponse(
        customer_name=customer_name,
        contact_number=contact_number,
        car_model=workflow.car_model,
        mileage=workflow.mileage,
        chassis_number=workflow.chassis_number,
        whatsapp_group_link=workflow.whatsapp_group_link,
    )

    return WorkflowResponse(
        id=workflow.workflow_id,
        unique_code=workflow.unique_ref,
        plate_number=workflow.plate_number,
        status=workflow.current_status.value,
        current_step=current_step_number,
        details=details,
        created_by=workflow.created_by,
        created_at=workflow.created_at,
        completed_at=workflow.closed_at,
        is_deleted=workflow.is_deleted,
    )


def _build_detail_response(workflow: Workflow) -> WorkflowDetailResponse:
    """Build a full workflow detail response with all steps."""
    sorted_steps = sorted(
        workflow.steps,
        key=lambda s: s.step_definition.step_number,
    )
    step_responses = [
        _build_step_response(s, s.step_definition) for s in sorted_steps
    ]
    current_step_number = _get_current_step_number(workflow)
    base = _build_workflow_response(workflow, current_step_number)

    return WorkflowDetailResponse(
        **base.model_dump(exclude={"steps"}, by_alias=False),
        steps=step_responses,
    )


async def _load_workflow(
    session: AsyncSession,
    workflow_id: str,
    include_deleted: bool = False,
) -> Workflow:
    """Load a workflow with steps, step definitions, and customer eagerly loaded."""
    filters = [Workflow.workflow_id == workflow_id]
    if not include_deleted:
        filters.append(Workflow.is_deleted == False)

    result = await session.execute(
        select(Workflow)
        .options(
            selectinload(Workflow.steps).selectinload(WorkflowStep.step_definition),
            selectinload(Workflow.customer),
            selectinload(Workflow.current_step).selectinload(
                WorkflowStep.step_definition
            ),
        )
        .where(*filters)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )
    return workflow


# ── Use Cases ────────────────────────────────────


async def create_workflow(
    session: AsyncSession,
    payload: CreateWorkflowRequest,
    current_user: User,
) -> WorkflowDetailResponse:
    """
    Create a new workflow with all 22 step instances.
    Step 1 (Create Workflow) is auto-completed on creation.
    Current step pointer advances to step 2.
    """
    # Generate collision-resistant unique ref
    for _ in range(10):
        unique_ref = _generate_unique_ref()
        exists = await session.execute(
            select(Workflow.workflow_id).where(Workflow.unique_ref == unique_ref)
        )
        if exists.scalar_one_or_none() is None:
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate unique reference. Please retry.",
        )

    # Create workflow record
    workflow = Workflow(
        plate_number=payload.plate_number.strip().upper(),
        unique_ref=unique_ref,
        created_by=current_user.user_id,
        current_status=WorkflowStatus.CREATED,
    )
    session.add(workflow)
    await session.flush()

    # Load step definitions in order
    result = await session.execute(
        select(WorkflowStepDefinition).order_by(
            WorkflowStepDefinition.step_number
        )
    )
    step_defs = result.scalars().all()

    if not step_defs:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No step definitions found. Run database seed first.",
        )

    # Create one WorkflowStep instance per definition
    now = datetime.utcnow()
    steps: list[tuple[WorkflowStep, WorkflowStepDefinition]] = []
    for step_def in step_defs:
        is_first = step_def.step_number == 1
        step = WorkflowStep(
            workflow_id=workflow.workflow_id,
            step_def_id=step_def.step_def_id,
            status=StepStatus.DONE if is_first else StepStatus.PENDING,
            ticked_by=current_user.user_id if is_first else None,
            ticked_at=now if is_first else None,
        )
        session.add(step)
        steps.append((step, step_def))

    await session.flush()

    # Point current_step to step 2
    step_2 = next((s for s, sd in steps if sd.step_number == 2), None)
    if step_2:
        workflow.current_step_id = step_2.step_id
    await session.flush()

    # Build response directly from in-memory objects
    step_responses = [_build_step_response(s, sd) for s, sd in steps]

    details = WorkflowDetailsResponse(
        customer_name=None,
        contact_number=None,
        car_model=workflow.car_model,
        mileage=workflow.mileage,
        chassis_number=workflow.chassis_number,
        whatsapp_group_link=workflow.whatsapp_group_link,
    )

    return WorkflowDetailResponse(
        id=workflow.workflow_id,
        unique_code=workflow.unique_ref,
        plate_number=workflow.plate_number,
        status=workflow.current_status.value,
        current_step=2,
        details=details,
        created_by=workflow.created_by,
        created_at=workflow.created_at,
        completed_at=workflow.closed_at,
        is_deleted=workflow.is_deleted,
        steps=step_responses,
    )


async def list_workflows(
    session: AsyncSession,
    include_deleted: bool = False,
    skip: int = 0,
    limit: int = 50,
) -> WorkflowListResponse:
    """List workflows with pagination, newest first."""
    base_filter = [] if include_deleted else [Workflow.is_deleted == False]

    count_q = select(func.count()).select_from(Workflow).where(*base_filter)
    total = (await session.execute(count_q)).scalar()

    q = (
        select(Workflow)
        .options(
            selectinload(Workflow.customer),
            selectinload(Workflow.current_step).selectinload(
                WorkflowStep.step_definition
            ),
        )
        .where(*base_filter)
        .order_by(Workflow.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await session.execute(q)
    workflows = result.scalars().all()

    return WorkflowListResponse(
        workflows=[
            _build_workflow_response(w, _get_current_step_number(w))
            for w in workflows
        ],
        total=total,
    )


async def get_workflow_detail(
    session: AsyncSession,
    workflow_id: str,
) -> WorkflowDetailResponse:
    """Get full workflow detail with all steps."""
    workflow = await _load_workflow(session, workflow_id)
    return _build_detail_response(workflow)


async def update_workflow_details(
    session: AsyncSession,
    workflow_id: str,
    payload: UpdateWorkflowDetailsRequest,
    current_user: User,
) -> WorkflowDetailResponse:
    """
    Update workflow vehicle/customer details (Step 6 fields).
    Creates a Customer record if none linked; updates it otherwise.
    """
    workflow = await _load_workflow(session, workflow_id)

    # Update vehicle fields on the Workflow row
    if payload.car_model is not None:
        workflow.car_model = payload.car_model
    if payload.mileage is not None:
        workflow.mileage = payload.mileage
    if payload.chassis_number is not None:
        workflow.chassis_number = payload.chassis_number
    if payload.whatsapp_group_link is not None:
        workflow.whatsapp_group_link = payload.whatsapp_group_link

    # Handle customer name / phone → Customer table
    if payload.customer_name is not None or payload.contact_number is not None:
        if workflow.customer_id and workflow.customer:
            # Update existing customer
            if payload.customer_name is not None:
                workflow.customer.name = payload.customer_name
            if payload.contact_number is not None:
                workflow.customer.phone = payload.contact_number
        else:
            # Create new customer and link
            customer = Customer(
                name=payload.customer_name or "Unknown",
                phone=payload.contact_number,
            )
            session.add(customer)
            await session.flush()
            workflow.customer_id = customer.customer_id
            workflow.customer = customer  # update ORM relationship cache

    await session.flush()
    return _build_detail_response(workflow)


async def delete_workflow(
    session: AsyncSession,
    workflow_id: str,
    current_user: User,
) -> dict:
    """
    Soft-delete a workflow.
    Rules:
      - Only admin / super_admin can delete.
      - No step beyond step 1 should have been completed.
    """
    user_role = UserRole(current_user.role.role_name.value)
    if user_role not in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or super_admin can delete workflows",
        )

    workflow = await _load_workflow(session, workflow_id)

    # Block deletion if any step past step 1 has been completed
    for step in workflow.steps:
        sd = step.step_definition
        if sd.step_number > 1 and step.status == StepStatus.DONE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete — steps have already progressed beyond creation",
            )

    workflow.is_deleted = True
    workflow.current_status = WorkflowStatus.DELETED
    await session.flush()

    return {"message": "Workflow deleted successfully"}


async def complete_step(
    session: AsyncSession,
    workflow_id: str,
    step_number: int,
    current_user: User,
    payload: CompleteStepRequest,
) -> WorkflowDetailResponse:
    """
    Complete / tick a workflow step with full validation:
      1. Step must exist and be PENDING.
      2. Step's tick_by must allow manual completion.
      3. User's role must be permitted for this tick_by.
      4. Previous required steps must be DONE (respecting independent, skippable,
         and no-tick exceptions).
      5. Step 6 requires customer details to be filled.
    """
    workflow = await _load_workflow(session, workflow_id)
    user_role = UserRole(current_user.role.role_name.value)

    # ── Locate the target step ───────────────────
    target_step: Optional[WorkflowStep] = None
    target_def: Optional[WorkflowStepDefinition] = None
    for step in workflow.steps:
        if step.step_definition.step_number == step_number:
            target_step = step
            target_def = step.step_definition
            break

    if target_step is None or target_def is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Step {step_number} not found for this workflow",
        )

    # ── Already completed? ───────────────────────
    if target_step.status == StepStatus.DONE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Step {step_number} is already completed",
        )

    # ── Can this step be manually ticked? ────────
    if target_def.tick_by in (TickBy.AUTO, TickBy.NONE):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Step {step_number} ({target_def.step_name}) cannot be manually completed",
        )

    # ── Role permission check ────────────────────
    allowed = TICK_BY_ALLOWED_ROLES.get(target_def.tick_by, [])
    if user_role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Your role ({user_role.value}) cannot complete this step. "
                f"Required: {target_def.tick_by.value}"
            ),
        )

    # ── Sequential ordering check ────────────────
    if step_number not in INDEPENDENT_STEPS:
        for step in workflow.steps:
            sd = step.step_definition
            if sd.step_number >= step_number:
                continue  # only check previous steps
            if sd.step_number in INDEPENDENT_STEPS:
                continue  # step 6 is independent
            if sd.step_number in SKIPPABLE_STEPS:
                continue  # step 12 is optional
            if sd.step_number in NO_TICK_STEPS:
                continue  # step 15 is status-display only
            if step.status != StepStatus.DONE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Step {sd.step_number} ({sd.step_name}) "
                        f"must be completed first"
                    ),
                )

    # ── Step 6 special validation: customer details required ─────
    if step_number == 6:
        missing = []
        if not workflow.customer or not workflow.customer.name:
            missing.append("customer_name")
        if not workflow.customer or not workflow.customer.phone:
            missing.append("contact_number")
        if not workflow.car_model:
            missing.append("car_model")
        if workflow.mileage is None:
            missing.append("mileage")
        if not workflow.chassis_number:
            missing.append("chassis_number")
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Cannot complete step 6: missing required fields: "
                    f"{', '.join(missing)}"
                ),
            )

    # ── Mark step as DONE ────────────────────────
    now = datetime.utcnow()
    target_step.status = StepStatus.DONE
    target_step.ticked_by = current_user.user_id
    target_step.ticked_at = now
    if payload.notes:
        target_step.notes = payload.notes

    # ── Update workflow status ───────────────────
    new_status = STEP_TO_WORKFLOW_STATUS.get(step_number)
    if new_status is not None:
        workflow.current_status = new_status

    # Close workflow on final step
    if step_number == 22:
        workflow.closed_at = now

    # ── Advance current_step pointer to the next pending step ────
    sorted_steps = sorted(
        workflow.steps,
        key=lambda s: s.step_definition.step_number,
    )
    next_pending = None
    for step in sorted_steps:
        sn = step.step_definition.step_number
        if sn > step_number and step.status == StepStatus.PENDING:
            next_pending = step
            break

    # Flush step changes first to avoid circular dependency
    # (WorkflowStep ↔ Workflow.current_step_id)
    # Note: post_update=True on Workflow.current_step handles the FK ordering
    if next_pending:
        workflow.current_step_id = next_pending.step_id

    await session.flush()
    return _build_detail_response(workflow)
