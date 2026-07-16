"""Sentiment detection use-case (Objective O3 — Checkpoint 11).

Flow:
  raw article → preprocess (CP7) → LLM structured JSON (CP9/11)
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass

from app.adapters.grok_client import generate_text
from app.adapters.llm_types import LlmGenerationResult
from app.prompts.sentiment import SENTIMENT_SYSTEM_PROMPT, build_sentiment_user_prompt
from app.schemas.sentiment import SentimentLabel
from app.services.preprocessing import clean_text

MIN_CLEANED_LENGTH = 50
SENTIMENT_TEMPERATURE = 0.1
SENTIMENT_MAX_OUTPUT_TOKENS = 256


@dataclass(frozen=True)
class SentimentResult:
    label: SentimentLabel
    confidence: float | None
    rationale: str
    original_length: int
    cleaned_length: int
    model: str
    latency_ms: int
    prompt_tokens: int | None
    output_tokens: int | None


def _parse_sentiment_json(raw_text: str) -> dict[str, object]:
    """Extract and parse JSON from LLM output (handles stray prose or fences)."""
    text = raw_text.strip()
    if not text:
        raise ValueError("LLM returned empty sentiment response.")

    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
    if fence_match:
        parsed = json.loads(fence_match.group(1))
        if isinstance(parsed, dict):
            return parsed

    object_match = re.search(r"\{.*\}", text, re.DOTALL)
    if object_match:
        parsed = json.loads(object_match.group(0))
        if isinstance(parsed, dict):
            return parsed

    raise ValueError(f"Could not parse sentiment JSON from LLM output: {text[:200]!r}")


def _normalize_label(raw_label: object) -> SentimentLabel:
    if not isinstance(raw_label, str):
        raise ValueError(f"Sentiment label must be a string, got {type(raw_label).__name__}.")
    normalized = raw_label.strip().lower()
    try:
        return SentimentLabel(normalized)
    except ValueError as exc:
        allowed = ", ".join(label.value for label in SentimentLabel)
        raise ValueError(f"Invalid sentiment label {raw_label!r}. Expected one of: {allowed}.") from exc


def _normalize_confidence(raw_confidence: object) -> float | None:
    if raw_confidence is None:
        return None
    if isinstance(raw_confidence, (int, float)):
        value = float(raw_confidence)
    elif isinstance(raw_confidence, str):
        value = float(raw_confidence.strip())
    else:
        raise ValueError(f"Confidence must be numeric, got {type(raw_confidence).__name__}.")

    if not 0.0 <= value <= 1.0:
        raise ValueError(f"Confidence must be between 0.0 and 1.0, got {value}.")
    return value


def analyze_sentiment(text: str) -> SentimentResult:
    """Classify news article sentiment with LLM-generated rationale."""
    preprocess = clean_text(text)
    cleaned = preprocess.cleaned_text

    if len(cleaned) < MIN_CLEANED_LENGTH:
        raise ValueError(
            f"Article too short after preprocessing ({len(cleaned)} chars). "
            f"Need at least {MIN_CLEANED_LENGTH}."
        )

    llm_result: LlmGenerationResult = generate_text(
        user_prompt=build_sentiment_user_prompt(cleaned),
        system_instruction=SENTIMENT_SYSTEM_PROMPT,
        temperature=SENTIMENT_TEMPERATURE,
        max_output_tokens=SENTIMENT_MAX_OUTPUT_TOKENS,
    )

    payload = _parse_sentiment_json(llm_result.text)
    label = _normalize_label(payload.get("label"))
    confidence = _normalize_confidence(payload.get("confidence"))

    raw_rationale = payload.get("rationale")
    if not isinstance(raw_rationale, str) or not raw_rationale.strip():
        raise ValueError("LLM response missing a non-empty rationale string.")
    rationale = raw_rationale.strip()

    return SentimentResult(
        label=label,
        confidence=confidence,
        rationale=rationale,
        original_length=len(text),
        cleaned_length=len(cleaned),
        model=llm_result.model,
        latency_ms=llm_result.latency_ms,
        prompt_tokens=llm_result.prompt_tokens,
        output_tokens=llm_result.output_tokens,
    )
