"""ORM models package.

Importing this package registers every table on ``Base.metadata`` so
that migrations and ``create_all`` can see them.
"""
from app.infrastructure.models import models  # noqa: F401
