"""Shared test setup.

Tests run against a real PostgreSQL database that already has the Flyway
migrations (V1, V2, ...) applied. Point DATABASE_URL at it before running
pytest; in GitHub Actions the workflow does this for you.
"""
import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="session")
def client():
    # One client for the whole run, so the async DB pool stays on one event loop.
    with TestClient(app) as c:
        yield c
