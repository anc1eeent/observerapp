"""
Fill the database with demo data for a presentation.

Creates the user `demo` with tasks of different priorities and due dates,
and Pomodoro sessions spread over the last week. Dates are relative to
today, so the demo always looks current.

Running the script again does not create duplicates: the demo user's
tasks and sessions are replaced with a fresh set.

Usage:
    docker compose run --rm api python -m scripts.seed
"""
from datetime import date, datetime, time, timedelta, timezone

import src.db_models  # noqa: F401  (registers all ORM models)
from src.database import SessionLocal
from src.pomodoro.models import PomodoroStats
from src.tasks.models import Task
from src.users import security, service
from src.users.models import User

DEMO_USERNAME = "demo"
DEMO_PASSWORD = "demo-password"
DEMO_EMAIL = "demo@observertasker.dev"

# (title, description, priority, due in N days or None, completed)
DEMO_TASKS = [
    ("Prepare the release demo", "Walk through every screen and collect screenshots", "high", 1, False),
    ("Submit the UML report", "Eight diagrams in PlantUML", "high", -2, False),
    ("Fix the session expiry bug", "Keep active users logged in", "high", 5, False),
    ("Review the CI pipeline", "Check that tests run on every pull request", "medium", 0, False),
    ("Write the CHANGELOG", "", "medium", 0, True),
    ("Read about refresh tokens", "Compare refresh tokens with sliding sessions", "medium", 3, False),
    ("Set up a Linux server", "Docker, firewall and HTTPS for the release", "medium", 12, False),
    ("Add monitoring", "Prometheus and Grafana after the deployment", "low", 20, False),
    ("Plan the redesign", "Collect ideas for v1.0", "low", None, False),
    ("Seed demo data", "", "medium", -1, True),
    ("Add priorities and due dates", "", "high", -3, True),
    ("Learn Alembic migrations", "rename_table, server_default, downgrade", "low", None, True),
]

# (task title or None, minutes, days ago, hour of the day)
DEMO_SESSIONS = [
    ("Prepare the release demo", 25, 0, 9),
    ("Prepare the release demo", 25, 0, 10),
    ("Review the CI pipeline", 15, 0, 12),
    ("Submit the UML report", 50, 1, 18),
    ("Add priorities and due dates", 45, 1, 20),
    (None, 25, 2, 8),
    ("Learn Alembic migrations", 30, 2, 19),
    ("Seed demo data", 20, 3, 17),
    ("Read about refresh tokens", 25, 4, 21),
    ("Add priorities and due dates", 40, 5, 16),
    (None, 20, 6, 10),
]


def get_or_create_demo_user(db) -> User:
    """Return the demo user, creating it on the first run."""
    user = service.get_user_by_username(db, DEMO_USERNAME)
    if user is None:
        user = User(username=DEMO_USERNAME, hashed_password=security.get_password_hash(DEMO_PASSWORD))
        db.add(user)
    user.email = DEMO_EMAIL
    db.flush()
    return user


def seed(db) -> User:
    """Replace the demo user's tasks and sessions with a fresh demo set."""
    user = get_or_create_demo_user(db)

    # Remove previous demo data so repeated runs do not create duplicates
    db.query(PomodoroStats).filter(PomodoroStats.owner_id == user.id).delete()
    db.query(Task).filter(Task.owner_id == user.id).delete()

    today = date.today()
    tasks_by_title = {}
    for title, description, priority, due_in_days, completed in DEMO_TASKS:
        task = Task(
            title=title,
            description=description or None,
            priority=priority,
            due_date=today + timedelta(days=due_in_days) if due_in_days is not None else None,
            completed=completed,
            owner_id=user.id,
        )
        db.add(task)
        tasks_by_title[title] = task
    db.flush()

    for title, minutes, days_ago, hour in DEMO_SESSIONS:
        started = datetime.combine(today - timedelta(days=days_ago), time(hour=hour), tzinfo=timezone.utc)
        db.add(PomodoroStats(
            owner_id=user.id,
            task_id=tasks_by_title[title].id if title else None,
            duration_seconds=minutes * 60,
            created_at=started,
        ))

    db.commit()
    return user


def main() -> None:
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
    print(f"Demo data is ready: {len(DEMO_TASKS)} tasks, {len(DEMO_SESSIONS)} Pomodoro sessions.")
    print(f"Log in as '{DEMO_USERNAME}' with password '{DEMO_PASSWORD}'.")


if __name__ == "__main__":
    main()
