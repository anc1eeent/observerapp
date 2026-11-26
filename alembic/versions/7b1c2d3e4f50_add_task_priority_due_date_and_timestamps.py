"""add task priority, due date and timestamps

Revision ID: 7b1c2d3e4f50
Revises: 63e7df5f6e46
Create Date: 2026-11-26 10:40:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = '7b1c2d3e4f50'
down_revision: Union[str, Sequence[str], None] = '63e7df5f6e46'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add priority, due date and creation time to tasks, and creation time to Pomodoro sessions."""
    # server_default fills existing rows, so NOT NULL columns can be added to a non-empty table
    op.add_column("tasks", sa.Column("priority", sa.String(length=10), nullable=False, server_default="medium"))
    op.add_column("tasks", sa.Column("due_date", sa.Date(), nullable=True))
    op.add_column(
        "tasks",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.add_column(
        "pomodoro_stats",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    """Remove the columns added in upgrade()."""
    op.drop_column("pomodoro_stats", "created_at")
    op.drop_column("tasks", "created_at")
    op.drop_column("tasks", "due_date")
    op.drop_column("tasks", "priority")
