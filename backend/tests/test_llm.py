"""Tests for Gemini integration layer (Checkpoint 9)."""

import pytest

from app.adapters.gemini_client import GeminiNotConfiguredError, generate_text
from app.core.config import clear_settings_cache, get_settings


def test_gemini_not_configured_without_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "")
    clear_settings_cache()

    from app.adapters import gemini_client

    gemini_client.clear_gemini_client_cache()

    with pytest.raises(GeminiNotConfiguredError):
        gemini_client.get_gemini_client()

    clear_settings_cache()
    gemini_client.clear_gemini_client_cache()


def test_demo_prompt_builder() -> None:
    from app.prompts.demo import build_demo_user_prompt

    prompt = build_demo_user_prompt("What is NLP?")
    assert "What is NLP?" in prompt
    assert "ArticleIQ" in prompt
