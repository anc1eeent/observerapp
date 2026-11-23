"""
Central registry of all ORM models.
Importing this module guarantees that every model is registered in
SQLAlchemy before the application or Alembic uses it.
"""
import src.habits.models  # noqa: F401
import src.pomodoro.models  # noqa: F401
import src.tasks.models  # noqa: F401
import src.users.models  # noqa: F401
