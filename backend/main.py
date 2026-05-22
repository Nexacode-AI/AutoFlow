"""Convenience entry point — re-exports the real app from app.main.

Both of these work:
    uvicorn main:app --reload
    uvicorn app.main:app --reload
"""
from app.main import app

__all__ = ["app"]
