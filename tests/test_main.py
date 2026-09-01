from fastapi.testclient import TestClient
from backend.main import ObserverTasker

client = TestClient(ObserverTasker)

def test_main():
    response = client.get("/docs")
    assert response.status_code == 200
