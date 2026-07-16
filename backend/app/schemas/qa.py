"""Schemas for POST /api/v1/qa (Objective O5 — implemented CP14)."""

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class QARequest(ArticleTextRequest):
    question: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="User question about the article",
    )


class QAResponse(BaseModel):
    answer: str
    grounded: bool = Field(
        ...,
        description="True when the answer is supported by the article text",
    )
