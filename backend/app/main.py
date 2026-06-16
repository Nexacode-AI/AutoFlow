"""AutoFlow backend — FastAPI application factory and entry point.

Run locally:   uvicorn app.main:app --reload
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from app.api.v1.router import api_router
from app.infrastructure.config import settings
from app.infrastructure.session import init_db
from app.middleware.cors import setup_cors

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AutoFlow backend (%s)...", settings.ENVIRONMENT)
    try:
        await init_db()
        logger.info("✓ Database initialized")
    except Exception as exc:  # noqa: BLE001
        logger.error("✗ Database initialization failed: %s", exc, exc_info=True)
        raise

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    logger.info("✓ Upload directory ready: %s", upload_dir.resolve())

    yield
    logger.info("Shutting down AutoFlow backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Complete car service workflow management",
    version=settings.VERSION,
    lifespan=lifespan,
)

setup_cors(app)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["health"])
async def read_root():
    return {"service": settings.PROJECT_NAME, "version": settings.VERSION}


@app.get("/health", tags=["health"])
async def health_check():
    """Liveness probe."""
    return {"status": "ok"}
