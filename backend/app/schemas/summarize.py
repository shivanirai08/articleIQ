"""Schemas for POST /api/v1/summarize (Objective O2)."""

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class SummarizeRequest(ArticleTextRequest):
    """Request body for summarization."""


class SummarizeResponse(BaseModel):
    summary: str = Field(..., description="Concise abstractive summary")
    original_length: int = Field(..., ge=0, description="Characters in raw input")
    cleaned_length: int = Field(..., ge=0, description="Characters after preprocessing")
    summary_length: int = Field(..., ge=0, description="Characters in summary")
    model: str = Field(..., description="LLM model id used")
    latency_ms: int = Field(..., ge=0, description="LLM round-trip time")
    prompt_tokens: int | None = None
    output_tokens: int | None = None
