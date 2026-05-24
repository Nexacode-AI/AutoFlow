"""JWT Token Blocklist — In-memory blocklist for invalidated tokens.

This is a simple in-memory implementation. For production with multiple
workers or servers, upgrade to Redis.

Usage:
    from app.core.token_blocklist import blocklist

    # On logout
    blocklist.add(token, expires_at)

    # On auth check
    if blocklist.is_blocked(token):
        raise HTTPException(401, "Token has been revoked")
"""
from datetime import UTC, datetime


class TokenBlocklist:
    """In-memory set of revoked JWT tokens with automatic cleanup."""

    def __init__(self):
        # Store tokens with their expiry timestamps
        self._blocked: dict[str, datetime] = {}

    def add(self, token: str, expires_at: datetime) -> None:
        """Add a token to the blocklist with its expiration time."""
        self._blocked[token] = expires_at
        self._cleanup()

    def is_blocked(self, token: str) -> bool:
        """Check if a token is in the blocklist."""
        self._cleanup()
        return token in self._blocked

    def _cleanup(self) -> None:
        """Remove expired tokens from the blocklist."""
        now = datetime.now(UTC)
        expired = [token for token, exp in self._blocked.items() if exp < now]
        for token in expired:
            del self._blocked[token]

    def clear(self) -> None:
        """Clear all blocked tokens (for testing)."""
        self._blocked.clear()


# Global singleton instance
blocklist = TokenBlocklist()
