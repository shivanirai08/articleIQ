"""Tests for Grok/Groq LLM integration."""

import pytest

from app.adapters.grok_client import GrokNotConfiguredError
from app.core.config import clear_settings_cache


def test_grok_not_configured_without_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("GROK_API_KEY", raising=False)
    monkeypatch.setenv("GROK_API_KEY", "")
    clear_settings_cache()

    from app.adapters import grok_client

    grok_client.clear_grok_client_cache()

    with pytest.raises(GrokNotConfiguredError):
        grok_client.get_grok_client()

    clear_settings_cache()
    grok_client.clear_grok_client_cache()


def test_groq_key_detection(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GROK_API_KEY", "gsk_test_key_for_unit_test_only")
    clear_settings_cache()
    from app.core.config import get_settings

    s = get_settings()
    assert s.llm_provider == "groq"
    assert "groq.com" in s.resolved_llm_base_url
    clear_settings_cache()


def test_demo_prompt_builder() -> None:
    from app.prompts.demo import build_demo_user_prompt

    prompt = build_demo_user_prompt("What is NLP?")
    assert "What is NLP?" in prompt
