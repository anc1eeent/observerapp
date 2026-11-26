"""
Tests for input validation: invalid data is rejected with 422,
a duplicate email with 409.
"""
import uuid

import pytest
from fastapi.testclient import TestClient


@pytest.mark.parametrize("title", ["", "   "])
def test_create_task_with_empty_title_is_rejected(
    client: TestClient, auth_headers: dict[str, str], title: str
):
    """A task title must contain at least one non-space character."""
    response = client.post("/tasks/", json={"title": title}, headers=auth_headers)
    assert response.status_code == 422, response.text


def test_update_task_with_empty_title_is_rejected(client: TestClient, auth_headers: dict[str, str]):
    """An existing task cannot be renamed to an empty title."""
    response = client.post("/tasks/", json={"title": "Valid title"}, headers=auth_headers)
    task_id = response.json()["id"]

    response = client.put(f"/tasks/{task_id}", json={"title": ""}, headers=auth_headers)
    assert response.status_code == 422, response.text


@pytest.mark.parametrize("duration", [0, -60])
def test_pomodoro_with_non_positive_duration_is_rejected(
    client: TestClient, auth_headers: dict[str, str], duration: int
):
    """A Pomodoro session must last more than zero seconds."""
    response = client.post("/pomodoro/", json={"duration_seconds": duration}, headers=auth_headers)
    assert response.status_code == 422, response.text


def test_profile_with_invalid_email_is_rejected(client: TestClient, auth_headers: dict[str, str]):
    """An email without a valid format is not saved."""
    response = client.patch("/users/me/profile", json={"email": "not-an-email"}, headers=auth_headers)
    assert response.status_code == 422, response.text


def test_profile_with_duplicate_email_returns_409(
    client: TestClient, auth_headers: dict[str, str], other_auth_headers: dict[str, str]
):
    """Two users cannot have the same email."""
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    response = client.patch("/users/me/profile", json={"email": email}, headers=auth_headers)
    assert response.status_code == 200, response.text

    response = client.patch("/users/me/profile", json={"email": email}, headers=other_auth_headers)
    assert response.status_code == 409, response.text


def test_profile_keeps_own_email(client: TestClient, auth_headers: dict[str, str]):
    """Saving the profile with the user's own email is not a conflict."""
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    client.patch("/users/me/profile", json={"email": email}, headers=auth_headers)

    response = client.patch("/users/me/profile", json={"email": email}, headers=auth_headers)
    assert response.status_code == 200, response.text
