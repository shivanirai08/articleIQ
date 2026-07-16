"""Pydantic request/response schemas — single import surface for routes and services."""

from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.schemas.common import ArticleTextRequest, ErrorResponse, ValidateArticleResponse
from app.schemas.entities import EntitiesRequest, EntitiesResponse, EntityItem
from app.schemas.keywords import KeywordItem, KeywordsRequest, KeywordsResponse
from app.schemas.qa import QARequest, QAResponse
from app.schemas.sentiment import SentimentLabel, SentimentRequest, SentimentResponse
from app.schemas.summarize import SummarizeRequest, SummarizeResponse
from app.schemas.system import HealthResponse

__all__ = [
    "AnalyzeRequest",
    "AnalyzeResponse",
    "ArticleTextRequest",
    "EntitiesRequest",
    "EntitiesResponse",
    "EntityItem",
    "ErrorResponse",
    "HealthResponse",
    "KeywordItem",
    "KeywordsRequest",
    "KeywordsResponse",
    "QARequest",
    "QAResponse",
    "SentimentLabel",
    "SentimentRequest",
    "SentimentResponse",
    "SummarizeRequest",
    "SummarizeResponse",
    "ValidateArticleResponse",
]
