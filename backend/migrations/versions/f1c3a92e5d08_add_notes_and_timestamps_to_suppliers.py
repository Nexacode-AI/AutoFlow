"""add notes and timestamps to suppliers

Adds:
  - suppliers.notes       (TEXT, nullable)
  - suppliers.created_at  (TIMESTAMP, default now())
  - suppliers.updated_at  (TIMESTAMP, default now())

Uses ADD COLUMN IF NOT EXISTS throughout so the migration is idempotent —
init_db()'s create_all() may have already applied these on fresh instances
before the migration runs.

Revision ID: f1c3a92e5d08
Revises: 3a8f2e9c1d74
Create Date: 2026-06-07 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'f1c3a92e5d08'
down_revision: Union[str, None] = '3a8f2e9c1d74'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE suppliers
            ADD COLUMN IF NOT EXISTS notes       TEXT,
            ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP NOT NULL DEFAULT now(),
            ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP NOT NULL DEFAULT now()
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE suppliers
            DROP COLUMN IF EXISTS updated_at,
            DROP COLUMN IF EXISTS created_at,
            DROP COLUMN IF EXISTS notes
    """)
