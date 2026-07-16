"""Google Gemini client adapter (Checkpoint 9).

Why an adapter:
  Services call generate_text() here — not the SDK directly everywhere.
  Swapping Gemini for another LLM later means changing one file.

Security:
  API key lives in Settings (.env) — NEVER in frontend code.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from functools import lru_cache

from google import genai
from google.genai import types

from app.core.config import get_settings


class GeminiNotConfiguredError(RuntimeError):
    """Raised when GEMINI_API_KEY is missing from environment."""


@dataclass(frozen=True)
class LlmGenerationResult:
    """Normalized result from one Gemini generate_content call."""

    text: str
    model: str
    latency_ms: int
    prompt_tokens: int | None
    output_tokens: int | None
    total_tokens: int | None


@lru_cache
def get_gemini_client() -> genai.Client:
    """Return a cached Gemini SDK client (one per process).

    Requires GEMINI_API_KEY in backend/.env
    """
    settings = get_settings()
    if not settings.gemini_configured:
        raise GeminiNotConfiguredError(
            "GEMINI_API_KEY is not set. Add it to backend/.env (never commit the file)."
        )
    return genai.Client(api_key=settings.gemini_api_key)


def clear_gemini_client_cache() -> None:
    get_gemini_client.cache_clear()


def generate_text(
    *,
    user_prompt: str,
    system_instruction: str,
    temperature: float | None = None,
    max_output_tokens: int | None = None,
    top_p: float | None = None,
) -> LlmGenerationResult:
    """Call Gemini generate_content and return normalized text + metadata.

    What happens when this runs:
      1. HTTP request goes to Google's Gemini API (cloud)
      2. Model reads system_instruction + user_prompt (context window)
      3. Model generates tokens autoregressively (temperature/top_p affect randomness)
      4. Response text + usage_metadata return to our server

    Input:
      user_prompt — the task/question (User Prompt)
      system_instruction — role/rules (System Prompt)

    Output:
      LlmGenerationResult with reply text, latency, token usage if available

    Latency: typically hundreds of ms to a few seconds (network + generation).
    Cost: billed per token (prompt + output) on Google's pricing.
    """
    settings = get_settings()
    model = settings.gemini_model
    temp = temperature if temperature is not None else settings.gemini_temperature
    max_tokens = (
        max_output_tokens
        if max_output_tokens is not None
        else settings.gemini_max_output_tokens
    )
    top_p_value = top_p if top_p is not None else settings.gemini_top_p

    client = get_gemini_client()
    started = time.perf_counter()

    response = client.models.generate_content(
        model=model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=temp,
            max_output_tokens=max_tokens,
            top_p=top_p_value,
        ),
    )

    latency_ms = int((time.perf_counter() - started) * 1000)

    text = (response.text or "").strip()
    if not text:
        raise RuntimeError("Gemini returned an empty response.")

    usage = response.usage_metadata
    prompt_tokens = getattr(usage, "prompt_token_count", None) if usage else None
    output_tokens = getattr(usage, "candidates_token_count", None) if usage else None
    total_tokens = getattr(usage, "total_token_count", None) if usage else None

    return LlmGenerationResult(
        text=text,
        model=model,
        latency_ms=latency_ms,
        prompt_tokens=prompt_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
    )
