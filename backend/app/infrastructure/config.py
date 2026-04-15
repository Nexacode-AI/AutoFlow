"""Application configuration (env vars, settings)."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "local"
    POSTGRES_DATABASE_URL: str = "postgresql+asyncpg://autoflow:autoflow123@localhost:5434/autoflow"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    class Config:
        env_file = ".env"
        extra = "ignore"

database_settings = Settings()