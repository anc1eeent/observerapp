"""align pomodoro table and foreign keys with models

Revision ID: 63e7df5f6e46
Revises: d754cbbf0c2a
Create Date: 2026-11-20 11:49:16.468405

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '63e7df5f6e46'
down_revision: Union[str, Sequence[str], None] = 'd754cbbf0c2a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rename PomodoroStats to pomodoro_stats and add ON DELETE CASCADE to foreign keys."""
    # Rename the table instead of drop + create, so existing rows are preserved
    op.rename_table("PomodoroStats", "pomodoro_stats")
    op.execute('ALTER INDEX "ix_PomodoroStats_id" RENAME TO ix_pomodoro_stats_id')
    op.execute('ALTER SEQUENCE "PomodoroStats_id_seq" RENAME TO pomodoro_stats_id_seq')
    op.execute('ALTER TABLE pomodoro_stats RENAME CONSTRAINT "PomodoroStats_pkey" TO pomodoro_stats_pkey')

    # Recreate pomodoro foreign keys with explicit names and ON DELETE CASCADE
    op.drop_constraint("PomodoroStats_owner_id_fkey", "pomodoro_stats", type_="foreignkey")
    op.drop_constraint("PomodoroStats_task_id_fkey", "pomodoro_stats", type_="foreignkey")
    op.create_foreign_key(
        "pomodoro_stats_owner_id_fkey", "pomodoro_stats", "users",
        ["owner_id"], ["id"], ondelete="CASCADE",
    )
    op.create_foreign_key(
        "pomodoro_stats_task_id_fkey", "pomodoro_stats", "tasks",
        ["task_id"], ["id"], ondelete="CASCADE",
    )

    # Task lists: deleting a user deletes their lists
    op.drop_constraint("task_lists_owner_id_fkey", "task_lists", type_="foreignkey")
    op.create_foreign_key(
        "task_lists_owner_id_fkey", "task_lists", "users",
        ["owner_id"], ["id"], ondelete="CASCADE",
    )

    # Tasks: deleting a user or a list deletes the related tasks
    op.drop_constraint("tasks_list_id_fkey", "tasks", type_="foreignkey")
    op.drop_constraint("tasks_owner_id_fkey", "tasks", type_="foreignkey")
    op.create_foreign_key(
        "tasks_list_id_fkey", "tasks", "task_lists",
        ["list_id"], ["id"], ondelete="CASCADE",
    )
    op.create_foreign_key(
        "tasks_owner_id_fkey", "tasks", "users",
        ["owner_id"], ["id"], ondelete="CASCADE",
    )


def downgrade() -> None:
    """Revert to the previous table name and foreign keys without ON DELETE CASCADE."""
    op.drop_constraint("tasks_owner_id_fkey", "tasks", type_="foreignkey")
    op.drop_constraint("tasks_list_id_fkey", "tasks", type_="foreignkey")
    op.create_foreign_key("tasks_owner_id_fkey", "tasks", "users", ["owner_id"], ["id"])
    op.create_foreign_key("tasks_list_id_fkey", "tasks", "task_lists", ["list_id"], ["id"])

    op.drop_constraint("task_lists_owner_id_fkey", "task_lists", type_="foreignkey")
    op.create_foreign_key("task_lists_owner_id_fkey", "task_lists", "users", ["owner_id"], ["id"])

    op.drop_constraint("pomodoro_stats_task_id_fkey", "pomodoro_stats", type_="foreignkey")
    op.drop_constraint("pomodoro_stats_owner_id_fkey", "pomodoro_stats", type_="foreignkey")
    op.create_foreign_key("PomodoroStats_task_id_fkey", "pomodoro_stats", "tasks", ["task_id"], ["id"])
    op.create_foreign_key("PomodoroStats_owner_id_fkey", "pomodoro_stats", "users", ["owner_id"], ["id"])

    op.execute('ALTER TABLE pomodoro_stats RENAME CONSTRAINT pomodoro_stats_pkey TO "PomodoroStats_pkey"')
    op.execute('ALTER SEQUENCE pomodoro_stats_id_seq RENAME TO "PomodoroStats_id_seq"')
    op.execute('ALTER INDEX ix_pomodoro_stats_id RENAME TO "ix_PomodoroStats_id"')
    op.rename_table("pomodoro_stats", "PomodoroStats")