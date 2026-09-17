"""Pytest test configuration and fixtures."""

import pytest
from backend.database.database import init_db

@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    """Ensures database tables are initialized before running tests."""
    init_db()
