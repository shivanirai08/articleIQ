"""Shared request/response building blocks for ArticleIQ APIs."""

from pydantic import BaseModel, Field


class ArticleTextRequest(BaseModel):
    """Base payload for endpoints that accept a news article.

    Used by: summarize, sentiment, keywords, entities, analyze (and QA extends this).

    Validation rules teach "garbage in → garbage out" for NLP/LLM pipelines.
    """

    text: str = Field(
        ...,
        min_length=50,
        max_length=50_000,
        description="Plain-text news article body",
        examples=[
            (
                "Scientists announced a breakthrough in renewable energy storage "
                "on Monday. The new battery design could reduce costs by thirty "
                "percent while improving capacity. Industry leaders welcomed the news."
            )
        ],
    )


class ValidateArticleResponse(BaseModel):
    """Response from POST /api/v1/validate-article (contract demo, Checkpoint 6)."""

    valid: bool = True
    character_count: int = Field(..., ge=0)
    word_count: int = Field(..., ge=0)


class ErrorResponse(BaseModel):
    """Standard error envelope for documented API failures."""

    detail: str
