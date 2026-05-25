"""add personal expenses tables (Issue #20)

Adds two tables for the Personal Expenses & Bank Statement Categorisation feature:
  - bank_statements  — tracks each uploaded bank statement PDF
  - personal_expenses — one row per parsed transaction

Also adds two new enum types:
  - bank_statement_status
  - personal_expense_category

Revision ID: b3f1a9c2e8d7
Revises: d85274cfabfc
Create Date: 2026-05-24 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b3f1a9c2e8d7"
down_revision: Union[str, None] = "d85274cfabfc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Enums ──────────────────────────────────────────────────────────────────
    op.execute(
        """
        CREATE TYPE bank_statement_status AS ENUM
        ('processing', 'completed', 'failed')
        """
    )
    op.execute(
        """
        CREATE TYPE personal_expense_category AS ENUM
        ('fuel_transport', 'utilities', 'meals_entertainment',
         'office_stationery', 'training_development',
         'marketing_advertising', 'equipment_maintenance', 'others')
        """
    )

    # ── bank_statements ────────────────────────────────────────────────────────
    op.create_table(
        "bank_statements",
        sa.Column("statement_id", sa.UUID(as_uuid=False), primary_key=True),
        sa.Column("admin_id", sa.UUID(as_uuid=False), sa.ForeignKey("users.user_id"), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_path", sa.Text, nullable=False),
        sa.Column(
            "status",
            sa.Enum("processing", "completed", "failed", name="bank_statement_status", create_type=False),
            nullable=False,
            server_default="processing",
        ),
        sa.Column("transaction_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("uploaded_at", sa.DateTime, nullable=False, server_default=sa.text("NOW()")),
    )

    # ── personal_expenses ──────────────────────────────────────────────────────
    op.create_table(
        "personal_expenses",
        sa.Column("expense_id", sa.UUID(as_uuid=False), primary_key=True),
        sa.Column("statement_id", sa.UUID(as_uuid=False), sa.ForeignKey("bank_statements.statement_id"), nullable=False),
        sa.Column("admin_id", sa.UUID(as_uuid=False), sa.ForeignKey("users.user_id"), nullable=False),
        sa.Column("transaction_date", sa.DateTime, nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "fuel_transport", "utilities", "meals_entertainment",
                "office_stationery", "training_development",
                "marketing_advertising", "equipment_maintenance", "others",
                name="personal_expense_category",
                create_type=False,
            ),
            nullable=False,
            server_default="others",
        ),
        sa.Column("is_recategorized", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.text("NOW()")),
    )

    # ── Indexes for common query patterns ──────────────────────────────────────
    op.create_index("ix_personal_expenses_admin_id", "personal_expenses", ["admin_id"])
    op.create_index("ix_personal_expenses_category", "personal_expenses", ["category"])
    op.create_index("ix_personal_expenses_statement_id", "personal_expenses", ["statement_id"])


def downgrade() -> None:
    op.drop_index("ix_personal_expenses_statement_id", table_name="personal_expenses")
    op.drop_index("ix_personal_expenses_category", table_name="personal_expenses")
    op.drop_index("ix_personal_expenses_admin_id", table_name="personal_expenses")
    op.drop_table("personal_expenses")
    op.drop_table("bank_statements")
    op.execute("DROP TYPE personal_expense_category")
    op.execute("DROP TYPE bank_statement_status")
