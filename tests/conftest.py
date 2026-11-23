"""
Shared pytest fixtures for API tests.
"""
import uuid

import pytest
from fastapi.testclient import TestClient

from src.main import ObserverTasker

TEST_PASSWORD = "password123"


@pytest.fixture
def client() -> TestClient:
    """HTTP client that sends requests directly to the FastAPI application."""
    return TestClient(ObserverTasker)


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    """Register a fresh user, log in and return the Authorization header."""
    username = f"user_{uuid.uuid4().hex[:8]}"
    client.post("/users/register", json={"username": username, "password": TEST_PASSWORD})
    response = client.post(
        "/users/login",
        data={"username": username, "password": TEST_PASSWORD},
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}