"""
Tests for the demo data script.
"""
from fastapi.testclient import TestClient

from scripts.seed import DEMO_PASSWORD, DEMO_SESSIONS, DEMO_TASKS, DEMO_USERNAME, seed
from src.database import SessionLocal
from src.pomodoro.models import PomodoroStats
from src.tasks.models import Task


def run_seed():
    db = SessionLocal()
    try:
        user = seed(db)
        tasks = db.query(Task).filter(Task.owner_id == user.id).count()
        sessions = db.query(PomodoroStats).filter(PomodoroStats.owner_id == user.id).count()
        return tasks, sessions
    finally:
        db.close()


def test_seed_can_run_twice_without_duplicates():
    """A second run replaces the demo data instead of adding to it."""
    run_seed()
    tasks, sessions = run_seed()
    assert tasks == len(DEMO_TASKS)
    assert sessions == len(DEMO_SESSIONS)


def test_demo_user_can_log_in_and_see_tasks(client: TestClient):
    """The seeded user can log in and gets the demo tasks with focus time."""
    run_seed()
    response = client.post("/users/login", data={"username": DEMO_USERNAME, "password": DEMO_PASSWORD})
    assert response.status_code == 200, response.text
    headers = {"Authorization": f"Bearer {response.json()['access_token']}"}

    tasks = client.get("/tasks/", headers=headers).json()
    assert len(tasks) == len(DEMO_TASKS)
    assert any(task["focus_seconds"] > 0 for task in tasks)
