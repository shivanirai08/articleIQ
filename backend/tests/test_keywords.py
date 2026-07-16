"""Tests for keyword extraction service (Checkpoint 12)."""

import pytest

from app.adapters.spacy_nlp import SpacyModelNotFoundError, get_spacy_nlp
from app.services.keywords import _normalize_key, extract_keywords


def _spacy_model_installed() -> bool:
    try:
        get_spacy_nlp()
        return True
    except SpacyModelNotFoundError:
        return False


pytestmark = pytest.mark.skipif(
    not _spacy_model_installed(),
    reason="spaCy model en_core_web_sm not installed",
)


def test_normalize_key_collapses_whitespace() -> None:
    assert _normalize_key("  Apple   Inc.  ") == "apple inc."


def test_extract_keywords_from_news_article() -> None:
    text = (
        "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino. "
        "Investors welcomed the earnings report and raised price targets. "
        "Analysts said cloud services demand drove growth across all regions."
    )
    result = extract_keywords(text, limit=8)
    assert len(result.keywords) <= 8
    assert result.candidate_count >= len(result.keywords)
    assert result.cleaned_length >= 50

    keyword_text = " ".join(item.keyword.lower() for item in result.keywords)
    assert "apple" in keyword_text or "revenue" in keyword_text or "earnings" in keyword_text
    assert all(item.score is not None and 0.0 <= item.score <= 1.0 for item in result.keywords)
    assert result.keywords[0].score == 1.0


def test_extract_keywords_respects_limit() -> None:
    text = (
        "Energy markets reacted to OPEC production cuts announced on Monday. "
        "Oil prices climbed while renewable stocks gained on policy news. "
        "Traders said supply concerns would dominate the week ahead."
    )
    result = extract_keywords(text, limit=3)
    assert len(result.keywords) == 3
