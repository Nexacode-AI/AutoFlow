"""add parts_catalogue table and extend part_categories

Adds:
  - part_categories.icon        (VARCHAR 50, nullable)
  - part_categories.sort_order  (INTEGER, default 0)
  - part_grade enum type        ('ORI', 'OM')
  - parts_catalogue table

Uses IF NOT EXISTS / exception-safe PL/pgSQL throughout so the migration is
idempotent — init_db()'s create_all() may have already applied these on fresh
instances before the migration runs.

Revision ID: 3a8f2e9c1d74
Revises: d85274cfabfc
Create Date: 2026-05-25 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '3a8f2e9c1d74'
down_revision: Union[str, None] = 'd85274cfabfc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PL/pgSQL block: create the enum or silently skip if already present
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE part_grade AS ENUM ('ORI', 'OM');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """)

    # ADD COLUMN IF NOT EXISTS is safe when create_all() ran ahead of this migration
    op.execute("""
        ALTER TABLE part_categories
            ADD COLUMN IF NOT EXISTS icon        VARCHAR(50),
            ADD COLUMN IF NOT EXISTS sort_order  INTEGER NOT NULL DEFAULT 0
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS parts_catalogue (
            catalogue_id  UUID         PRIMARY KEY,
            category_id   UUID         NOT NULL
                              REFERENCES part_categories(category_id),
            name          VARCHAR(150) NOT NULL,
            grade         part_grade   NOT NULL,
            warranty_months INTEGER    NOT NULL DEFAULT 12,
            is_active     BOOLEAN      NOT NULL DEFAULT true,
            deleted_at    TIMESTAMP,
            created_at    TIMESTAMP    NOT NULL DEFAULT now()
        )
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS parts_catalogue")
    op.execute("ALTER TABLE part_categories DROP COLUMN IF EXISTS sort_order")
    op.execute("ALTER TABLE part_categories DROP COLUMN IF EXISTS icon")
    op.execute("DROP TYPE IF EXISTS part_grade")
