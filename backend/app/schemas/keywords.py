"""Schemas for POST /api/v1/keywords (Objective O4 — implemented CP12)."""

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class KeywordsRequest(ArticleTextRequest):
    """Request body for keyword extraction."""

    limit: int = Field(
        default=10,
        ge=1,
        le=30,
        description="Maximum number of keywords to return",
    )


class KeywordItem(BaseModel):
    keyword: str
    score: float | None = Field(default=None, ge=0.0, description="Relative importance")


class KeywordsResponse(BaseModel):
    keywords: list[KeywordItem]
    spacy_model: str
    original_length: int = Field(..., ge=0)
    cleaned_length: int = Field(..., ge=0)
    candidate_count: int = Field(..., ge=0, description="Unique candidates before top-k cut")
    limit: int = Field(..., ge=1, le=30)
