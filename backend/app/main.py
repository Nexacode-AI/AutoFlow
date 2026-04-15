import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.middleware.cors import setup_cors
from app.infrastructure.session import init_db, AsyncSessionLocal
from app.infrastructure.seed import run_seed
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.workflow import router as workflow_router
from app.api.v1.routes.parts import router as parts_router

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database + seed
    logger.info("Starting application lifespan...")
    try:
        logger.info("Attempting to initialize database...")
        await init_db()
        logger.info("✓ Database initialized successfully")

        # Seed roles, step definitions, default super admin
        async with AsyncSessionLocal() as session:
            await run_seed(session)
    except Exception as e:
        logger.error(f"✗ Failed to initialize database: {e}", exc_info=True)
        raise
    
    yield
    
    # Shutdown: Add cleanup logic here if needed
    logger.info("Application shutting down...")

app = FastAPI(
    title="AutoFlow — Workshop Workflow Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# Setup CORS middleware
setup_cors(app)

# ── API v1 routes ────────────────────────────────
app.include_router(auth_router, prefix="/api/v1")
app.include_router(workflow_router, prefix="/api/v1")
app.include_router(parts_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AutoFlow API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
