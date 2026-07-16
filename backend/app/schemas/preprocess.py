"""Schemas for POST /api/v1/preprocess (Objective O1 — Checkpoint 7)."""

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class PreprocessRequest(ArticleTextRequest):
    """Request body for text preprocessing."""


class PreprocessResponse(BaseModel):
    cleaned_text: str = Field(..., description="Normalized plain text ready for NLP/LLM")
    original_character_count: int = Field(..., ge=0)
    cleaned_character_count: int = Field(..., ge=0)
    word_count: int = Field(..., ge=0)
    transformations_applied: list[str] = Field(
        default_factory=list,
        description="Audit trail of cleaning steps that modified the input",
    )
