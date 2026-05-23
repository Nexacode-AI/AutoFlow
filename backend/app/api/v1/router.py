"""API v1 router aggregator.

Each feature owner (P1–P7) adds their route module here:

    from app.api.v1.routes import jobs
    api_router.include_router(jobs.router)
"""
from fastapi import APIRouter

from app.api.v1.routes import admin, auth, users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(users.router)

# ── Feature routers — added by P1–P7 as slices land ──
# api_router.include_router(workflows.router)   # P1 / P2
# api_router.include_router(intake.router)      # P3
# api_router.include_router(parts.router)       # P4
# api_router.include_router(estimate.router)    # P5
# api_router.include_router(repair.router)      # P6
# api_router.include_router(finance.router)     # P7
