"""Tests for full-analysis orchestrator (Checkpoint 15)."""

import json

import pytest

from app.adapters.llm_types import LlmGenerationResult
from app.adapters.spacy_nlp import SpacyModelNotFoundError, get_spacy_nlp
from app.services.analyze import analyze_article


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


def _mock_llm(monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_summarize(**kwargs: object) -> LlmGenerationResult:
        return LlmGenerationResult(
            text="Markets rose after strong earnings were reported across regions.",
            model="test-model",
            latency_ms=100,
            prompt_tokens=200,
            output_tokens=30,
            total_tokens=230,
        )

    def fake_sentiment(**kwargs: object) -> LlmGenerationResult:
        payload = {
            "label": "positive",
            "confidence": 0.9,
            "rationale": "The article highlights strong earnings and rising markets.",
        }
        return LlmGenerationResult(
            text=json.dumps(payload),
            model="test-model",
            latency_ms=80,
            prompt_tokens=180,
            output_tokens=35,
            total_tokens=215,
        )

    monkeypatch.setattr("app.services.summarize.generate_text", fake_summarize)
    monkeypatch.setattr("app.services.sentiment.generate_text", fake_sentiment)


def test_analyze_article_composes_all_sections(monkeypatch: pytest.MonkeyPatch) -> None:
    _mock_llm(monkeypatch)

    article = (
        "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino. "
        "The company said revenue rose eighteen percent year over year. "
        "Chief executive Tim Cook told investors that cloud demand accelerated."
    )
    result = analyze_article(article, keyword_limit=5)

    assert result.summary is not None
    assert result.sentiment is not None
    assert result.keywords is not None
    assert result.entities is not None
    assert result.errors == []
    assert result.total_latency_ms >= 0
    assert len(result.keywords.keywords) <= 5


def test_analyze_article_partial_failure_when_llm_missing(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail_llm(**kwargs: object) -> LlmGenerationResult:
        raise RuntimeError("LLM unavailable")

    monkeypatch.setattr("app.services.summarize.generate_text", fail_llm)
    monkeypatch.setattr("app.services.sentiment.generate_text", fail_llm)

    article = (
        "Microsoft Corp. opened a new data center in Dublin on Monday. "
        "Local officials welcomed the investment in renewable infrastructure. "
        "Analysts said the expansion would create hundreds of regional jobs."
    )
    result = analyze_article(article)

    assert result.keywords is not None
    assert result.entities is not None
    assert result.summary is None
    assert result.sentiment is None
    assert len(result.errors) == 2
    assert {error.section for error in result.errors} == {"summary", "sentiment"}
