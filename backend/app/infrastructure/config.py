"""Application configuration (env vars, settings)."""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "local"
    POSTGRES_DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/dbname"

    class Config:
        env_file = ".env"
        extra = "ignore"

database_settings = Settings()