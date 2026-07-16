"""Schemas for POST /api/v1/tokenize (Checkpoint 8 — classical NLP)."""

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class TokenizeRequest(ArticleTextRequest):
    """Request body for tokenization + sentence segmentation."""


class TokenItem(BaseModel):
    index: int = Field(..., ge=0)
    text: str
    lemma: str = Field(..., description="Dictionary/base form of the token")
    pos: str = Field(..., description="Part-of-speech tag (Universal POS)")
    is_alpha: bool
    is_stop: bool = Field(..., description="True if spaCy marks this as a stop word")


class SentenceItem(BaseModel):
    index: int = Field(..., ge=0)
    text: str
    start_char: int = Field(..., ge=0)
    end_char: int = Field(..., ge=0)


class TokenizeResponse(BaseModel):
    spacy_model: str
    cleaned_character_count: int = Field(..., ge=0)
    token_count: int = Field(..., ge=0)
    sentence_count: int = Field(..., ge=0)
    sentences: list[SentenceItem]
    tokens: list[TokenItem]
    tokens_truncated: bool = Field(
        default=False,
        description="True when token list is capped for API payload size",
    )
