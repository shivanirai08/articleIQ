"""Tests for summarization service (Checkpoint 10)."""

from app.adapters.llm_types import LlmGenerationResult
from app.services.summarize import summarize_article


def test_summarize_article_with_mocked_llm(monkeypatch) -> None:
    def fake_generate(**kwargs: object) -> LlmGenerationResult:
        assert "ARTICLE START" in kwargs["user_prompt"]
        assert kwargs["system_instruction"]
        return LlmGenerationResult(
            text=(
                "Markets rose after the company reported strong earnings. "
                "Analysts noted improved margins across regions. "
                "Investors welcomed the quarterly results."
            ),
            model="test-model",
            latency_ms=100,
            prompt_tokens=200,
            output_tokens=40,
            total_tokens=240,
        )

    monkeypatch.setattr("app.services.summarize.generate_text", fake_generate)

    article = (
        "TechCorp announced record quarterly earnings on Monday. "
        "Revenue grew eighteen percent year over year across all regions. "
        "Analysts said margins improved due to cost controls and strong demand."
    )
    result = summarize_article(article)
    assert result.summary_length > 0
    assert result.cleaned_length >= 50
    assert result.model == "test-model"
    assert result.output_tokens == 40
