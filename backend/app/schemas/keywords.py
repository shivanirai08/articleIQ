"""Schemas for POST /api/v1/keywords (Objective O4 — implemented CP12)."""

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class KeywordsRequest(ArticleTextRequest):
    """Request body for keyword extraction."""


class KeywordItem(BaseModel):
    keyword: str
    score: float | None = Field(default=None, ge=0.0, description="Relative importance")


class KeywordsResponse(BaseModel):
    keywords: list[KeywordItem]
