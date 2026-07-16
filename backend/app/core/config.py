"""Application settings for ArticleIQ backend."""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
XAI_BASE_URL = "https://api.x.ai/v1"
GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile"
XAI_DEFAULT_MODEL = "grok-3-mini"


class Settings(BaseSettings):
    """Typed application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = Field(default="ArticleIQ")
    app_env: Literal["development", "staging", "production"] = Field(default="development")
    api_prefix: str = Field(default="/api/v1")

    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # --- LLM (Grok / Groq via GROK_API_KEY) ---
    grok_api_key: str | None = Field(
        default=None,
        description="Groq (gsk_) or xAI Grok (xai-) API key — server-side only",
    )
    grok_model: str | None = Field(
        default=None,
        description="Override model id; auto-selected if empty based on key type",
    )
    llm_base_url: str | None = Field(
        default=None,
        description="Override API base URL (auto-detect Groq/xAI if empty)",
    )
    llm_temperature: float = Field(default=0.3, ge=0.0, le=2.0)
    llm_top_p: float = Field(default=0.95, ge=0.0, le=1.0)
    llm_max_output_tokens: int = Field(default=1024, ge=64, le=8192)

    spacy_model: str = Field(default="en_core_web_sm")
    spacy_token_preview_limit: int = Field(default=150, ge=10, le=1000)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return ["http://localhost:3000"]

    @property
    def llm_configured(self) -> bool:
        return bool(self.grok_api_key and self.grok_api_key.strip())

    @property
    def llm_provider(self) -> str:
        """Detect provider from key prefix."""
        key = (self.grok_api_key or "").strip()
        if key.startswith("gsk_"):
            return "groq"
        if key.startswith("xai-"):
            return "xai"
        return "custom"

    @property
    def resolved_llm_base_url(self) -> str:
        if self.llm_base_url:
            return self.llm_base_url.rstrip("/")
        if self.llm_provider == "groq":
            return GROQ_BASE_URL
        if self.llm_provider == "xai":
            return XAI_BASE_URL
        return GROQ_BASE_URL

    @property
    def resolved_llm_model(self) -> str:
        if self.grok_model and self.grok_model.strip():
            return self.grok_model.strip()
        if self.llm_provider == "xai":
            return XAI_DEFAULT_MODEL
        return GROQ_DEFAULT_MODEL


@lru_cache
def get_settings() -> Settings:
    return Settings()


def clear_settings_cache() -> None:
    get_settings.cache_clear()
