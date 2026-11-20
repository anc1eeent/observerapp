"""
Integration tests for Pomodoro sessions.
"""
from fastapi.testclient import TestClient


def test_create_pomodoro_for_own_task(client: TestClient, auth_headers: dict[str, str]):
    """A user can log a Pomodoro session for a task they own."""
    # Create a task to attach the session to
    response = client.post("/tasks/", json={"title": "Write tests"}, headers=auth_headers)
    assert response.status_code == 200, response.text
    task_id = response.json()["id"]

    # Log a 25-minute session for that task
    response = client.post(
        "/pomodoro/",
        json={"duration_seconds": 25 * 60, "task_id": task_id},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text

    body = response.json()
    assert body["task_id"] == task_id
    assert body["duration_seconds"] == 25 * 60