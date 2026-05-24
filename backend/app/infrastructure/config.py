"""Application configuration — single source of truth for all settings.

Values are loaded from environment variables (or a local .env file).
See .env.example for the full list.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Environment ──
    ENVIRONMENT: str = "local"  # local | dev | prod

    # ── Project ──
    PROJECT_NAME: str = "AutoFlow"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    # ── Database ──
    POSTGRES_DATABASE_URL: str = (
        "postgresql+asyncpg://autoflow:autoflow@localhost:5432/autoflow"
    )

    # ── Auth / JWT ──
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12 hours

    # ── Frontend ──
    FRONTEND_URL: str = "http://localhost:5174"

    # ── CORS (comma-separated origins) ──
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "prod"


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Module-level handle used across the app.
settings = get_settings()
database_settings = settings  # backwards-compatible alias
