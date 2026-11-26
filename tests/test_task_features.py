"""
Tests for task priority, due date and focus time.
"""
from fastapi.testclient import TestClient


def test_task_has_default_priority_and_creation_time(client: TestClient, auth_headers: dict[str, str]):
    """A new task gets medium priority, no due date and a creation time."""
    response = client.post("/tasks/", json={"title": "Defaults"}, headers=auth_headers)
    assert response.status_code == 200, response.text

    body = response.json()
    assert body["priority"] == "medium"
    assert body["due_date"] is None
    assert body["created_at"]


def test_task_priority_and_due_date_can_be_set_and_changed(client: TestClient, auth_headers: dict[str, str]):
    """Priority and due date are saved on create and update."""
    response = client.post(
        "/tasks/",
        json={"title": "Exam", "priority": "high", "due_date": "2026-12-15"},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text
    task_id = response.json()["id"]

    response = client.put(
        f"/tasks/{task_id}", json={"priority": "low", "due_date": None}, headers=auth_headers
    )
    assert response.status_code == 200, response.text
    assert response.json()["priority"] == "low"
    assert response.json()["due_date"] is None


def test_invalid_priority_and_due_date_are_rejected(client: TestClient, auth_headers: dict[str, str]):
    """Only low, medium and high are valid priorities; the due date must be a date."""
    response = client.post("/tasks/", json={"title": "X", "priority": "urgent"}, headers=auth_headers)
    assert response.status_code == 422, response.text

    response = client.post("/tasks/", json={"title": "X", "due_date": "tomorrow"}, headers=auth_headers)
    assert response.status_code == 422, response.text


def test_task_list_shows_total_focus_time(client: TestClient, auth_headers: dict[str, str]):
    """GET /tasks/ sums the Pomodoro sessions linked to each task."""
    response = client.post("/tasks/", json={"title": "Deep work"}, headers=auth_headers)
    task_id = response.json()["id"]

    for minutes in (25, 15):
        response = client.post(
            "/pomodoro/",
            json={"duration_seconds": minutes * 60, "task_id": task_id},
            headers=auth_headers,
        )
        assert response.status_code == 200, response.text
        assert response.json()["created_at"]

    tasks = client.get("/tasks/", headers=auth_headers).json()
    task = next(item for item in tasks if item["id"] == task_id)
    assert task["focus_seconds"] == 40 * 60
