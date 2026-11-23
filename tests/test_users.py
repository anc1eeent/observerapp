"""
Integration tests for the user authentication flow.
Covers registration and login through the public API.
"""
import uuid

from fastapi.testclient import TestClient

from src.main import ObserverTasker

client = TestClient(ObserverTasker)

TEST_PASSWORD = "password123"


def unique_username() -> str:
    """Generate a unique username so repeated test runs do not collide (409)."""
    return f"user_{uuid.uuid4().hex[:8]}"


def test_register_and_login_returns_token():
    """A newly registered user can log in and receives a bearer access token."""
    username = unique_username()

    # Register a new user
    response = client.post(
        "/users/register",
        json={"username": username, "password": TEST_PASSWORD},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["username"] == username

    # Log in with the same credentials
    response = client.post(
        "/users/login",
        data={"username": username, "password": TEST_PASSWORD}
    )
    assert response.status_code == 200, response.text

    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]