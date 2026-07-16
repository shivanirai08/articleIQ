"""Full-analysis orchestration for the interactive UI — Checkpoint 15.

Facade pattern: one entry point composes existing services (O2–O4) without
duplicating their business logic.

Partial failure policy:
  - Each section runs independently; failures are collected in errors[].
  - HTTP 200 when at least one section succeeds.
  - HTTP 502 only when every section fails.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field

from app.schemas.analyze import AnalyzeSection, AnalyzeSectionError
from app.schemas.entities import EntitiesResponse, EntityItem
from app.schemas.keywords import KeywordItem, KeywordsResponse
from app.schemas.sentiment import SentimentResponse
from app.schemas.summarize import SummarizeResponse
from app.services.entities import extract_entities
from app.services.keywords import extract_keywords
from app.services.sentiment import analyze_sentiment
from app.services.summarize import summarize_article


@dataclass
class AnalyzeResult:
    summary: SummarizeResponse | None = None
    sentiment: SentimentResponse | None = None
    keywords: KeywordsResponse | None = None
    entities: EntitiesResponse | None = None
    errors: list[AnalyzeSectionError] = field(default_factory=list)
    total_latency_ms: int = 0


def _record_error(
    errors: list[AnalyzeSectionError],
    section: AnalyzeSection,
    exc: Exception,
) -> None:
    errors.append(AnalyzeSectionError(section=section, detail=str(exc)))


def analyze_article(text: str, keyword_limit: int = 10) -> AnalyzeResult:
    """Run summary, sentiment, keywords, and entities for one article."""
    started = time.perf_counter()
    result = AnalyzeResult()

    try:
        keywords_result = extract_keywords(text, limit=keyword_limit)
        result.keywords = KeywordsResponse(
            keywords=[
                KeywordItem(keyword=item.keyword, score=item.score)
                for item in keywords_result.keywords
            ],
            spacy_model=keywords_result.spacy_model,
            original_length=keywords_result.original_length,
            cleaned_length=keywords_result.cleaned_length,
            candidate_count=keywords_result.candidate_count,
            limit=keyword_limit,
        )
    except Exception as exc:
        _record_error(result.errors, "keywords", exc)

    try:
        entities_result = extract_entities(text)
        result.entities = EntitiesResponse(
            entities=[
                EntityItem(
                    text=item.text,
                    label=item.label,
                    start=item.start,
                    end=item.end,
                )
                for item in entities_result.entities
            ],
            spacy_model=entities_result.spacy_model,
            original_length=entities_result.original_length,
            cleaned_length=entities_result.cleaned_length,
            entity_count=entities_result.entity_count,
            unique_labels=entities_result.unique_labels,
        )
    except Exception as exc:
        _record_error(result.errors, "entities", exc)

    try:
        summary_result = summarize_article(text)
        result.summary = SummarizeResponse(
            summary=summary_result.summary,
            original_length=summary_result.original_length,
            cleaned_length=summary_result.cleaned_length,
            summary_length=summary_result.summary_length,
            model=summary_result.model,
            latency_ms=summary_result.latency_ms,
            prompt_tokens=summary_result.prompt_tokens,
            output_tokens=summary_result.output_tokens,
        )
    except Exception as exc:
        _record_error(result.errors, "summary", exc)

    try:
        sentiment_result = analyze_sentiment(text)
        result.sentiment = SentimentResponse(
            label=sentiment_result.label,
            confidence=sentiment_result.confidence,
            rationale=sentiment_result.rationale,
            original_length=sentiment_result.original_length,
            cleaned_length=sentiment_result.cleaned_length,
            model=sentiment_result.model,
            latency_ms=sentiment_result.latency_ms,
            prompt_tokens=sentiment_result.prompt_tokens,
            output_tokens=sentiment_result.output_tokens,
        )
    except Exception as exc:
        _record_error(result.errors, "sentiment", exc)

    result.total_latency_ms = int((time.perf_counter() - started) * 1000)

    if not any((result.summary, result.sentiment, result.keywords, result.entities)):
        sections = ", ".join(error.section for error in result.errors)
        raise RuntimeError(f"All analysis sections failed: {sections}")

    return result
