"""Schemas for POST /api/v1/analyze (orchestrator — implemented CP15)."""

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest
from app.schemas.entities import EntitiesResponse
from app.schemas.keywords import KeywordsResponse
from app.schemas.sentiment import SentimentResponse
from app.schemas.summarize import SummarizeResponse

AnalyzeSection = Literal["summary", "sentiment", "keywords", "entities"]


class AnalyzeRequest(ArticleTextRequest):
    """Full analysis in one request for the interactive UI (O6)."""

    keyword_limit: int = Field(
        default=10,
        ge=1,
        le=30,
        description="Maximum keywords to include in the analysis",
    )


class AnalyzeSectionError(BaseModel):
    section: AnalyzeSection
    detail: str


class AnalyzeResponse(BaseModel):
    summary: SummarizeResponse | None = None
    sentiment: SentimentResponse | None = None
    keywords: KeywordsResponse | None = None
    entities: EntitiesResponse | None = None
    errors: list[AnalyzeSectionError] = Field(default_factory=list)
    total_latency_ms: int = Field(..., ge=0)
