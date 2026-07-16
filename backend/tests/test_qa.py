"""Tests for grounded Q&A service (Checkpoint 14)."""

import json

from app.adapters.llm_types import LlmGenerationResult
from app.services.qa import answer_question


def test_answer_question_grounded(monkeypatch) -> None:
    def fake_generate(**kwargs: object) -> LlmGenerationResult:
        assert "ARTICLE START" in kwargs["user_prompt"]
        assert "QUESTION" in kwargs["user_prompt"]
        assert kwargs["system_instruction"]
        payload = {
            "answer": "Revenue rose eighteen percent year over year.",
            "grounded": True,
        }
        return LlmGenerationResult(
            text=json.dumps(payload),
            model="test-model",
            latency_ms=120,
            prompt_tokens=300,
            output_tokens=40,
            total_tokens=340,
        )

    monkeypatch.setattr("app.services.qa.generate_text", fake_generate)

    article = (
        "TechCorp announced record quarterly earnings on Monday. "
        "Revenue grew eighteen percent year over year across all regions. "
        "Analysts said margins improved due to cost controls and strong demand."
    )
    result = answer_question(article, "How much did revenue grow?")
    assert result.grounded is True
    assert "eighteen percent" in result.answer.lower()
    assert result.model == "test-model"


def test_answer_question_refusal(monkeypatch) -> None:
    def fake_generate(**kwargs: object) -> LlmGenerationResult:
        payload = {
            "answer": "The article does not mention the CEO's name.",
            "grounded": False,
        }
        return LlmGenerationResult(
            text=json.dumps(payload),
            model="test-model",
            latency_ms=90,
            prompt_tokens=250,
            output_tokens=25,
            total_tokens=275,
        )

    monkeypatch.setattr("app.services.qa.generate_text", fake_generate)

    article = (
        "Markets rose after the company reported strong earnings on Tuesday. "
        "Investors welcomed improved margins and resilient enterprise spending. "
        "Analysts raised price targets following the quarterly results."
    )
    result = answer_question(article, "What is the CEO's name?")
    assert result.grounded is False
    assert result.answer
