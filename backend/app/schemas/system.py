"""Schemas for GET /health (system)."""

from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str
    environment: Literal["development", "staging", "production"]
    gemini_configured: bool = Field(
        description="True when GEMINI_API_KEY is set (never exposes the key)",
    )
