"""AutoFlow backend — FastAPI application entry point."""

from fastapi import FastAPI

app = FastAPI(
    title="AutoFlow",
    description="Complete car service workflow management",
    version="0.1.0",
)


@app.get("/health", tags=["health"])
async def health_check():
    """Liveness probe."""
    return {"status": "ok"}
