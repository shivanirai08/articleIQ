"""Shared LLM result type used by provider adapters."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LlmGenerationResult:
    """Normalized result from one LLM completion call."""

    text: str
    model: str
    latency_ms: int
    prompt_tokens: int | None
    output_tokens: int | None
    total_tokens: int | None
