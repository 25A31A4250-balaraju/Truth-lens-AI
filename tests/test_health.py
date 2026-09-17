"""Tests for system health and diagnostics endpoint."""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "CPU" in data["device"]
    assert data["ram_total_gb"] > 0
    assert data["database_connected"] is True
    assert data["registered_models_count"] == 6


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "DEEPTRACE-X"
    assert data["status"] == "online"
