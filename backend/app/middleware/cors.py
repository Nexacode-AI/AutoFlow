"""CORS middleware configuration.

Allowed origins come from the CORS_ORIGINS setting (see config.py).
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.config import settings

logger = logging.getLogger(__name__)


def setup_cors(app: FastAPI) -> None:
    """Attach CORS middleware to the FastAPI application."""
    origins = settings.cors_origins_list

    if settings.is_production:
        allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]
        allow_headers = ["Authorization", "Content-Type", "Accept", "Origin"]
    else:
        allow_methods = ["*"]
        allow_headers = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=allow_methods,
        allow_headers=allow_headers,
    )
    logger.info("CORS configured for %s — origins: %s", settings.ENVIRONMENT, origins)
