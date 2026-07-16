"""Question answering use-case with prompt engineering (Objective O5 — Checkpoint 14).

Flow:
  raw article + question → preprocess (CP7) → grounded LLM JSON (CP9/14)
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass

from app.adapters.grok_client import generate_text
from app.adapters.llm_types import LlmGenerationResult
from app.prompts.qa import QA_SYSTEM_PROMPT, build_qa_user_prompt
from app.services.preprocessing import clean_text

MIN_CLEANED_LENGTH = 50
QA_TEMPERATURE = 0.1
QA_MAX_OUTPUT_TOKENS = 512


@dataclass(frozen=True)
class QAResult:
    answer: str
    grounded: bool
    question: str
    original_length: int
    cleaned_length: int
    model: str
    latency_ms: int
    prompt_tokens: int | None
    output_tokens: int | None


def _parse_qa_json(raw_text: str) -> dict[str, object]:
    """Extract and parse JSON from LLM output."""
    text = raw_text.strip()
    if not text:
        raise ValueError("LLM returned empty Q&A response.")

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

    raise ValueError(f"Could not parse Q&A JSON from LLM output: {text[:200]!r}")


def _normalize_grounded(raw_grounded: object) -> bool:
    if isinstance(raw_grounded, bool):
        return raw_grounded
    if isinstance(raw_grounded, str):
        normalized = raw_grounded.strip().lower()
        if normalized in {"true", "1", "yes"}:
            return True
        if normalized in {"false", "0", "no"}:
            return False
    raise ValueError(f"grounded must be a boolean, got {raw_grounded!r}.")


def answer_question(text: str, question: str) -> QAResult:
    """Answer a user question grounded in the provided news article."""
    preprocess = clean_text(text)
    cleaned = preprocess.cleaned_text
    trimmed_question = question.strip()

    if len(cleaned) < MIN_CLEANED_LENGTH:
        raise ValueError(
            f"Article too short after preprocessing ({len(cleaned)} chars). "
            f"Need at least {MIN_CLEANED_LENGTH}."
        )

    llm_result: LlmGenerationResult = generate_text(
        user_prompt=build_qa_user_prompt(cleaned, trimmed_question),
        system_instruction=QA_SYSTEM_PROMPT,
        temperature=QA_TEMPERATURE,
        max_output_tokens=QA_MAX_OUTPUT_TOKENS,
    )

    payload = _parse_qa_json(llm_result.text)
    grounded = _normalize_grounded(payload.get("grounded"))

    raw_answer = payload.get("answer")
    if not isinstance(raw_answer, str) or not raw_answer.strip():
        raise ValueError("LLM response missing a non-empty answer string.")
    answer = raw_answer.strip()

    return QAResult(
        answer=answer,
        grounded=grounded,
        question=trimmed_question,
        original_length=len(text),
        cleaned_length=len(cleaned),
        model=llm_result.model,
        latency_ms=llm_result.latency_ms,
        prompt_tokens=llm_result.prompt_tokens,
        output_tokens=llm_result.output_tokens,
    )
