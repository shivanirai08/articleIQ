"""Shared pytest fixtures for API integration tests."""

import pytest
from fastapi.testclient import TestClient

from app.main import create_app

SAMPLE_ARTICLE = (
    "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino, California. "
    "The company said revenue rose eighteen percent year over year, driven by strong "
    "cloud services demand. Chief executive Tim Cook told investors that margins improved."
)


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


@pytest.fixture
def sample_article() -> str:
    return SAMPLE_ARTICLE
