"""Tests for sentiment analysis service (Checkpoint 11)."""

import json

from app.adapters.llm_types import LlmGenerationResult
from app.schemas.sentiment import SentimentLabel
from app.services.sentiment import analyze_sentiment


def test_analyze_sentiment_with_mocked_llm(monkeypatch) -> None:
    def fake_generate(**kwargs: object) -> LlmGenerationResult:
        assert "ARTICLE START" in kwargs["user_prompt"]
        assert kwargs["system_instruction"]
        payload = {
            "label": "positive",
            "confidence": 0.91,
            "rationale": "The article highlights rising markets and strong earnings.",
        }
        return LlmGenerationResult(
            text=json.dumps(payload),
            model="test-model",
            latency_ms=80,
            prompt_tokens=180,
            output_tokens=35,
            total_tokens=215,
        )

    monkeypatch.setattr("app.services.sentiment.generate_text", fake_generate)

    article = (
        "Markets rose after the company reported record quarterly earnings. "
        "Analysts praised improved margins and strong demand across regions. "
        "Investors welcomed the upbeat guidance from management."
    )
    result = analyze_sentiment(article)
    assert result.label == SentimentLabel.positive
    assert result.confidence == 0.91
    assert "earnings" in result.rationale.lower()
    assert result.model == "test-model"
    assert result.cleaned_length >= 50


def test_analyze_sentiment_parses_json_fence(monkeypatch) -> None:
    def fake_generate(**kwargs: object) -> LlmGenerationResult:
        return LlmGenerationResult(
            text=(
                "```json\n"
                '{"label": "negative", "confidence": 0.77, '
                '"rationale": "Layoffs and falling revenue dominate the story."}\n'
                "```"
            ),
            model="test-model",
            latency_ms=90,
            prompt_tokens=150,
            output_tokens=30,
            total_tokens=180,
        )

    monkeypatch.setattr("app.services.sentiment.generate_text", fake_generate)

    article = (
        "The firm announced layoffs affecting thousands of workers nationwide. "
        "Revenue fell sharply as customers cut spending during the downturn. "
        "Executives warned that further restructuring may be required."
    )
    result = analyze_sentiment(article)
    assert result.label == SentimentLabel.negative
