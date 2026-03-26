"""Admin-related middleware (auth, rate-limiting)."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os

def get_cors_origins() -> List[str]:
    """
    Get CORS origins based on the environment.
    
    Returns:
        List of allowed origins for the current environment
    """
    environment = os.getenv("ENVIRONMENT", "local").lower()
    
    cors_config = {
        "local": [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ],
        "dev": [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://dev.yourapp.com",
            "https://dev-frontend.yourapp.com",
        ],
        "prod": [
            "https://yourapp.com",
            "https://www.yourapp.com",
        ]
    }
    
    return cors_config.get(environment, cors_config["local"])


def setup_cors(app: FastAPI) -> None:
    """
    Configure CORS middleware for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    environment = os.getenv("ENVIRONMENT", "local").lower()
    allowed_origins = get_cors_origins()
    
    # More permissive settings for local/dev environments
    allow_credentials = True
    allow_methods = ["*"]
    allow_headers = ["*"]
    
    # Stricter settings for production
    if environment == "prod":
        allow_methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
        allow_headers = [
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
        ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=allow_credentials,
        allow_methods=allow_methods,
        allow_headers=allow_headers,
    )
    
    print(f"CORS configured for {environment} environment")
    print(f"Allowed origins: {allowed_origins}")
