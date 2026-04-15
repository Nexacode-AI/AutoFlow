"""Workflow-related Pydantic schemas (request / response).

Response models use camelCase aliases to match frontend conventions.
Request models accept both camelCase and snake_case.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Shared config for camelCase output ───────────


def _to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])


class CamelModel(BaseModel):
    """Base model that serialises fields as camelCase."""

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=_to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
    )


# ── Requests ─────────────────────────────────────


class CreateWorkflowRequest(CamelModel):
    plate_number: str = Field(min_length=1, max_length=20)


class UpdateWorkflowDetailsRequest(CamelModel):
    customer_name: Optional[str] = Field(default=None, max_length=100)
    contact_number: Optional[str] = Field(default=None, max_length=20)
    car_model: Optional[str] = Field(default=None, max_length=100)
    mileage: Optional[int] = Field(default=None, ge=0)
    chassis_number: Optional[str] = Field(default=None, max_length=50)
    whatsapp_group_link: Optional[str] = None


class CompleteStepRequest(CamelModel):
    notes: Optional[str] = None


# ── Nested details object (matches frontend Workflow.details) ────


class WorkflowDetailsResponse(CamelModel):
    customer_name: Optional[str] = None
    contact_number: Optional[str] = None
    car_model: Optional[str] = None
    mileage: Optional[int] = None
    chassis_number: Optional[str] = None
    whatsapp_group_link: Optional[str] = None


# ── Responses ────────────────────────────────────


class WorkflowStepResponse(CamelModel):
    id: str = Field(alias="id")
    workflow_id: str = ""
    step_number: int
    step_name: str
    status: str
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None
    notes: Optional[str] = None


class WorkflowResponse(CamelModel):
    id: str = Field(alias="id")
    unique_code: str
    plate_number: str
    status: str
    current_step: Optional[int] = None
    details: WorkflowDetailsResponse = WorkflowDetailsResponse()
    created_by: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    is_deleted: bool = False


class WorkflowDetailResponse(WorkflowResponse):
    steps: List[WorkflowStepResponse] = []


class WorkflowListResponse(CamelModel):
    workflows: List[WorkflowResponse]
    total: int
