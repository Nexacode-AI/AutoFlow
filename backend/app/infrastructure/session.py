"""Async SQLAlchemy session factory and engine configuration."""
import logging
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Importing the models package registers every table on Base.metadata.
from app.infrastructure import models  # noqa: F401

from .base import Base
from .config import database_settings

logger = logging.getLogger(__name__)

logger.info(f"Connecting to database: {database_settings.POSTGRES_DATABASE_URL}")

engine = create_async_engine(
    database_settings.POSTGRES_DATABASE_URL,
    echo=False,  # Set to True only for debugging SQL queries
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

async def init_db():
    # create_all() is safe to call on every startup — it is a no-op for tables
    # that already exist. However it only CREATES tables; it never alters them.
    # New columns / schema changes on existing tables require an Alembic migration:
    #   make migrate   →   alembic upgrade head
    try:
        logger.info("▶ Starting database initialization...")
        logger.info("▶ Creating tables from metadata...")
        async with engine.begin() as conn:
            logger.info("▶ Running metadata.create_all()...")
            await conn.run_sync(Base.metadata.create_all)
            logger.info("✓ Database tables created successfully!")
    except Exception as e:
        logger.error(f"✗ Error initializing database: {e}", exc_info=True)
        raise

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"✗ Database session error: {e}", exc_info=True)
            raise
        finally:
            await session.close()
