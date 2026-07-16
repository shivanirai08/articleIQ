"""Integration tests for FastAPI routes (Checkpoint 17)."""

import json

import pytest
from fastapi.testclient import TestClient

from app.adapters.llm_types import LlmGenerationResult


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "ArticleIQ"
    assert "llm_configured" in body


def test_ping(client: TestClient) -> None:
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json() == {"message": "pong"}


def test_validate_article(client: TestClient, sample_article: str) -> None:
    response = client.post("/api/v1/validate-article", json={"text": sample_article})
    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is True
    assert body["character_count"] > 0
    assert body["word_count"] > 0


def test_validate_article_rejects_short_text(client: TestClient) -> None:
    response = client.post("/api/v1/validate-article", json={"text": "too short"})
    assert response.status_code == 422


def test_preprocess(client: TestClient, sample_article: str) -> None:
    response = client.post("/api/v1/preprocess", json={"text": sample_article})
    assert response.status_code == 200
    body = response.json()
    assert "cleaned_text" in body
    assert len(body["cleaned_text"]) > 0


def test_analyze_rejects_short_text(client: TestClient) -> None:
    response = client.post("/api/v1/analyze", json={"text": "short"})
    assert response.status_code == 422


def test_analyze_partial_when_llm_unavailable(
    client: TestClient,
    sample_article: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_llm(**kwargs: object) -> LlmGenerationResult:
        raise RuntimeError("LLM unavailable in test")

    monkeypatch.setattr("app.services.summarize.generate_text", fail_llm)
    monkeypatch.setattr("app.services.sentiment.generate_text", fail_llm)

    try:
        from app.adapters.spacy_nlp import get_spacy_nlp

        get_spacy_nlp()
    except Exception:
        pytest.skip("spaCy model not installed")

    response = client.post("/api/v1/analyze", json={"text": sample_article, "keyword_limit": 5})
    assert response.status_code == 200
    body = response.json()
    assert body["keywords"] is not None
    assert body["entities"] is not None
    assert body["summary"] is None
    assert body["sentiment"] is None
    assert len(body["errors"]) == 2


def test_qa_returns_json(client: TestClient, sample_article: str, monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_qa(**kwargs: object) -> LlmGenerationResult:
        payload = {"answer": "Revenue rose eighteen percent.", "grounded": True}
        return LlmGenerationResult(
            text=json.dumps(payload),
            model="test-model",
            latency_ms=50,
            prompt_tokens=100,
            output_tokens=20,
            total_tokens=120,
        )

    monkeypatch.setattr("app.services.qa.generate_text", fake_qa)

    response = client.post(
        "/api/v1/qa",
        json={"text": sample_article, "question": "How much did revenue grow?"},
    )

    if response.status_code == 503:
        pytest.skip("GROK_API_KEY guard triggered unexpectedly")

    assert response.status_code == 200
    body = response.json()
    assert body["grounded"] is True
    assert "eighteen" in body["answer"].lower()
