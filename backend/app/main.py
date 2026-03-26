import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.middleware.cors import setup_cors
from app.infrastructure.session import init_db 

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    logger.info("Starting application lifespan...")
    try:
        logger.info("Attempting to initialize database...")
        await init_db()
        logger.info("✓ Database initialized successfully")
    except Exception as e:
        logger.error(f"✗ Failed to initialize database: {e}", exc_info=True)
        raise
    
    yield
    
    # Shutdown: Add cleanup logic here if needed
    logger.info("Application shutting down...")

app = FastAPI(lifespan=lifespan)

# Setup CORS middleware
setup_cors(app)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Portal API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
