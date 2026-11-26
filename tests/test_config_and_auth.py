"""
Tests for startup configuration and token validation.
"""
import pytest
from fastapi.testclient import TestClient

from src.config import load_settings


def test_missing_secret_key_stops_the_application(monkeypatch: pytest.MonkeyPatch, tmp_path):
    """Without SECRET_KEY the settings fail to load and name the variable."""
    monkeypatch.chdir(tmp_path)  # no .env file here
    monkeypatch.delenv("SECRET_KEY", raising=False)

    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        load_settings()


def test_short_secret_key_is_rejected(monkeypatch: pytest.MonkeyPatch, tmp_path):
    """A secret key that is too short is treated as invalid configuration."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("SECRET_KEY", "short")

    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        load_settings()


@pytest.mark.parametrize("token", ["garbage", "a.b.c"])
def test_invalid_token_returns_401(client: TestClient, token: str):
    """A malformed or forged token is rejected with 401, not 500."""
    response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401, response.text


def test_request_without_token_returns_401(client: TestClient):
    """Protected endpoints require a token."""
    response = client.get("/tasks/")
    assert response.status_code == 401, response.text
