"""Grok / Groq LLM client adapter (OpenAI-compatible API).

Your `GROK_API_KEY` may be from:
  - **Groq** (keys start with `gsk_`) → https://api.groq.com/openai/v1
  - **xAI Grok** (keys start with `xai-`) → https://api.x.ai/v1

We auto-detect from the key prefix. Many people say "Grok" when they mean Groq — both work here.

Security: GROK_API_KEY stays in backend/.env only — never in the frontend.
"""

from __future__ import annotations

import time
from functools import lru_cache

from openai import OpenAI

from app.adapters.llm_types import LlmGenerationResult
from app.core.config import get_settings


class GrokNotConfiguredError(RuntimeError):
    """Raised when GROK_API_KEY is missing from environment."""


@lru_cache
def get_grok_client() -> OpenAI:
    """Return a cached OpenAI-compatible client for Groq or xAI."""
    settings = get_settings()
    if not settings.llm_configured:
        raise GrokNotConfiguredError(
            "GROK_API_KEY is not set. Add it to backend/.env (never commit the file)."
        )
    return OpenAI(api_key=settings.grok_api_key, base_url=settings.resolved_llm_base_url)


def clear_grok_client_cache() -> None:
    get_grok_client.cache_clear()


def generate_text(
    *,
    user_prompt: str,
    system_instruction: str,
    temperature: float | None = None,
    max_output_tokens: int | None = None,
    top_p: float | None = None,
) -> LlmGenerationResult:
    """Call Groq/xAI chat completions and return normalized text + metadata."""
    settings = get_settings()
    model = settings.resolved_llm_model
    temp = temperature if temperature is not None else settings.llm_temperature
    max_tokens = (
        max_output_tokens if max_output_tokens is not None else settings.llm_max_output_tokens
    )
    top_p_value = top_p if top_p is not None else settings.llm_top_p

    client = get_grok_client()
    started = time.perf_counter()

    response = client.chat.completions.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temp,
        top_p=top_p_value,
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt},
        ],
    )

    latency_ms = int((time.perf_counter() - started) * 1000)

    choice = response.choices[0] if response.choices else None
    text = (choice.message.content if choice and choice.message else "") or ""
    text = text.strip()
    if not text:
        raise RuntimeError("LLM returned an empty response.")

    usage = response.usage
    prompt_tokens = usage.prompt_tokens if usage else None
    output_tokens = usage.completion_tokens if usage else None
    total_tokens = usage.total_tokens if usage else None

    return LlmGenerationResult(
        text=text,
        model=model,
        latency_ms=latency_ms,
        prompt_tokens=prompt_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
    )
