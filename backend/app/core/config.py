"""Application settings for ArticleIQ backend.

Checkpoint 3: simple defaults (enough to boot FastAPI + CORS).
Checkpoint 4: will upgrade this to typed pydantic-settings + .env loading.

Why this file exists:
  Central place for configuration so main.py does not hardcode magic strings.

Who imports this:
  app.main (and later services/adapters).

What happens if removed:
  Call sites break; settings would get duplicated and drift.
"""

from __future__ import annotations

import os


def _csv_env(name: str, default: str) -> list[str]:
    """Split a comma-separated env var into a clean list of strings."""
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


APP_NAME: str = os.getenv("APP_NAME", "ArticleIQ")
APP_ENV: str = os.getenv("APP_ENV", "development")
API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")

# Frontend origin(s) allowed to call this API from a browser.
# Browsers enforce CORS; curl/Postman do not need this.
CORS_ORIGINS: list[str] = _csv_env("CORS_ORIGINS", "http://localhost:3000")
