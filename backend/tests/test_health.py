import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


TEST_SETTINGS = {
    "DATABASE_URL": "sqlite+aiosqlite:///:memory:",
    "SECRET_KEY": "test-secret-key-for-nexora",
    "CSRF_SECRET_KEY": "test-csrf-secret-key",
    "GOOGLE_CLIENT_ID": "test-client-id",
    "GOOGLE_CLIENT_SECRET": "test-client-secret",
    "GOOGLE_REDIRECT_URI": "http://localhost:8000/api/v1/auth/oauth/google/callback",
    "SMTP_HOST": "localhost",
    "SMTP_USER": "test@example.com",
    "SMTP_PASSWORD": "test-password",
    "SMTP_FROM": "test@example.com",
    "FRONTEND_URL": "http://localhost:5173",
}

for key, value in TEST_SETTINGS.items():
    os.environ.setdefault(key, value)

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


def test_root_and_health_endpoints():
    with TestClient(app) as client:
        root = client.get("/")
        health = client.get("/health")

    assert root.status_code == 200
    assert root.json()["status"] == "online"
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"
