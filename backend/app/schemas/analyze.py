"""Schemas for POST /api/v1/analyze (orchestrator — implemented CP15)."""

from pydantic import BaseModel

from app.schemas.common import ArticleTextRequest
from app.schemas.entities import EntitiesResponse
from app.schemas.keywords import KeywordsResponse
from app.schemas.sentiment import SentimentResponse
from app.schemas.summarize import SummarizeResponse


class AnalyzeRequest(ArticleTextRequest):
    """Full analysis in one request for the interactive UI (O6)."""


class AnalyzeResponse(BaseModel):
    summary: SummarizeResponse
    sentiment: SentimentResponse
    keywords: KeywordsResponse
    entities: EntitiesResponse
