"""Shared pytest fixtures for AutoFlow backend tests."""
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    """An HTTP client wired directly to the ASGI app (no network, no DB).

    Feature tests that need a database should add their own fixture that
    spins up a transactional session against the test Postgres instance.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
