"""Schemas for POST /api/v1/summarize (Objective O2 — implemented CP10)."""

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class SummarizeRequest(ArticleTextRequest):
    """Request body for summarization."""


class SummarizeResponse(BaseModel):
    summary: str = Field(..., description="Concise abstractive summary")
    original_length: int = Field(..., ge=0)
    summary_length: int = Field(..., ge=0)
