"""Workflow API routes — CRUD and step management."""
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
from app.application.dto.workflow import (
    CompleteStepRequest,
    CreateWorkflowRequest,
    UpdateWorkflowDetailsRequest,
    WorkflowDetailResponse,
    WorkflowListResponse,
    WorkflowStepResponse,
)
from app.application.usecases.workflow import (
    complete_step,
    create_workflow,
    delete_workflow,
    get_workflow_detail,
    list_workflows,
    update_workflow_details,
)
from app.infrastructure.models.models import User
from app.infrastructure.session import get_db

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.post("", response_model=WorkflowDetailResponse, status_code=201)
async def api_create_workflow(
    payload: CreateWorkflowRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new workflow using car plate number. Step 1 is auto-completed."""
    return await create_workflow(session, payload, current_user)


@router.get("", response_model=WorkflowListResponse)
async def api_list_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    include_deleted: bool = Query(False),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all workflows with pagination."""
    return await list_workflows(session, include_deleted, skip, limit)


@router.get("/{workflow_id}", response_model=WorkflowDetailResponse)
async def api_get_workflow(
    workflow_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full workflow detail including all 22 steps."""
    return await get_workflow_detail(session, workflow_id)


@router.put("/{workflow_id}", response_model=WorkflowDetailResponse)
async def api_update_workflow(
    workflow_id: str,
    payload: UpdateWorkflowDetailsRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update workflow customer/vehicle details (Step 6 fields)."""
    return await update_workflow_details(session, workflow_id, payload, current_user)


@router.delete("/{workflow_id}")
async def api_delete_workflow(
    workflow_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "admin"])),
):
    """Soft-delete a workflow. Admin/super_admin only, before any step progression."""
    return await delete_workflow(session, workflow_id, current_user)


@router.post(
    "/{workflow_id}/steps/{step_number}/complete",
    response_model=WorkflowDetailResponse,
)
async def api_complete_step(
    workflow_id: str,
    step_number: int,
    payload: CompleteStepRequest = CompleteStepRequest(),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Complete/tick a workflow step with role and ordering validation."""
    return await complete_step(
        session, workflow_id, step_number, current_user, payload
    )


@router.get("/{workflow_id}/steps", response_model=List[WorkflowStepResponse])
async def api_get_workflow_steps(
    workflow_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all steps for a specific workflow."""
    detail = await get_workflow_detail(session, workflow_id)
    return detail.steps
