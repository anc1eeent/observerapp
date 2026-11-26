"""
Tests for ownership checks: a user cannot reference or change
another user's tasks and task lists.
"""
from fastapi.testclient import TestClient

from src.database import SessionLocal
from src.tasks import models as task_models


def create_task(client: TestClient, headers: dict[str, str]) -> int:
    """Create a task for the user and return its id."""
    response = client.post("/tasks/", json={"title": "Private task"}, headers=headers)
    assert response.status_code == 200, response.text
    return response.json()["id"]


def create_task_list_for(headers_owner_task_id: int) -> int:
    """Create a task list owned by the owner of the given task; return the list id.

    There is no API endpoint for task lists yet, so the list is created in the database.
    """
    db = SessionLocal()
    try:
        task = db.get(task_models.Task, headers_owner_task_id)
        task_list = task_models.TaskList(name="Private list", owner_id=task.owner_id)
        db.add(task_list)
        db.commit()
        return task_list.id
    finally:
        db.close()


def test_pomodoro_for_another_users_task_returns_404(
    client: TestClient, auth_headers: dict[str, str], other_auth_headers: dict[str, str]
):
    """A Pomodoro session cannot be linked to someone else's task."""
    foreign_task_id = create_task(client, other_auth_headers)

    response = client.post(
        "/pomodoro/",
        json={"duration_seconds": 25 * 60, "task_id": foreign_task_id},
        headers=auth_headers,
    )
    assert response.status_code == 404, response.text


def test_task_in_another_users_list_returns_404(
    client: TestClient, auth_headers: dict[str, str], other_auth_headers: dict[str, str]
):
    """A task cannot be created in, or moved to, someone else's list."""
    foreign_list_id = create_task_list_for(create_task(client, other_auth_headers))

    response = client.post(
        "/tasks/", json={"title": "Sneaky", "list_id": foreign_list_id}, headers=auth_headers
    )
    assert response.status_code == 404, response.text

    own_task_id = create_task(client, auth_headers)
    response = client.put(
        f"/tasks/{own_task_id}", json={"list_id": foreign_list_id}, headers=auth_headers
    )
    assert response.status_code == 404, response.text


def test_another_users_task_cannot_be_changed_or_deleted(
    client: TestClient, auth_headers: dict[str, str], other_auth_headers: dict[str, str]
):
    """Updating or deleting someone else's task returns 404."""
    foreign_task_id = create_task(client, other_auth_headers)

    response = client.put(f"/tasks/{foreign_task_id}", json={"title": "Hacked"}, headers=auth_headers)
    assert response.status_code == 404, response.text

    response = client.delete(f"/tasks/{foreign_task_id}", headers=auth_headers)
    assert response.status_code == 404, response.text


def test_pomodoro_without_task_is_allowed(client: TestClient, auth_headers: dict[str, str]):
    """A session does not have to be linked to a task."""
    response = client.post("/pomodoro/", json={"duration_seconds": 60}, headers=auth_headers)
    assert response.status_code == 200, response.text
    assert response.json()["task_id"] is None
