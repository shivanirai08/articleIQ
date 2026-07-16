"""Schemas for POST /api/v1/sentiment (Objective O3 — implemented CP11)."""

from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class SentimentLabel(str, Enum):
    positive = "positive"
    negative = "negative"
    neutral = "neutral"
    mixed = "mixed"


class SentimentRequest(ArticleTextRequest):
    """Request body for sentiment analysis."""


class SentimentResponse(BaseModel):
    label: SentimentLabel
    confidence: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Optional model confidence score",
    )
    rationale: str = Field(..., description="Short explanation of the label")
