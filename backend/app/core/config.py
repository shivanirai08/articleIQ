"""Application settings for ArticleIQ backend.

Checkpoint 4: typed configuration loaded from environment variables and `.env`.

Why this file exists:
  One authoritative place for configuration. Prevents magic strings scattered
  across routes, services, and adapters.

Who imports this:
  app.main, and later services/adapters (Gemini client, etc.).

What happens if removed:
  Every module would read os.getenv independently → drift and secret leaks.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings.

    Values are loaded in this order (later wins):
      1. Defaults defined on this class
      2. Variables from a `.env` file in the working directory
      3. Real environment variables (highest priority)

    Real-world analogy:
      `.env` = your personal notebook of settings for this machine.
      Environment variables = instructions pinned on the wall by ops/deploy.
      The wall wins if both disagree.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Application identity ---
    app_name: str = Field(default="ArticleIQ", description="Service display name")
    app_env: Literal["development", "staging", "production"] = Field(
        default="development",
        description="Runtime environment label (not a secret)",
    )
    api_prefix: str = Field(default="/api/v1", description="Versioned API mount path")

    # --- CORS (Objective O6: browser UI on another origin) ---
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        description="Allowed browser origins (comma-separated in .env)",
    )

    # --- LLM (Checkpoint 9+) ---
    gemini_api_key: str | None = Field(
        default=None,
        description="Google Gemini API key — server-side only, never in frontend",
    )
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        description="Default Gemini model id for summary/sentiment/QA",
    )

    # --- Classical NLP (Checkpoint 8+) ---
    spacy_model: str = Field(
        default="en_core_web_sm",
        description="spaCy pipeline model name (download separately)",
    )
    spacy_token_preview_limit: int = Field(
        default=150,
        ge=10,
        le=1000,
        description="Max tokens returned in API preview responses",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        """Accept either a list or a comma-separated string from `.env`."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return ["http://localhost:3000"]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def gemini_configured(self) -> bool:
        """True when a non-empty Gemini key is present (used in health checks)."""
        return bool(self.gemini_api_key and self.gemini_api_key.strip())


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton per process).

    Why cache:
      Settings are read once at startup. Re-parsing `.env` on every request
      would be wasteful and could hide configuration bugs.

    Time complexity: O(1) after first call.
    Space complexity: O(1) — one Settings object.
    """
    return Settings()


def clear_settings_cache() -> None:
    """Clear cached settings — useful in tests when env vars change."""
    get_settings.cache_clear()
