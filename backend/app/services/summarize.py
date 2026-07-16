"""Summarization use-case (Objective O2 — Checkpoint 10).

Flow:
  raw article → preprocess (CP7) → LLM abstractive summary (CP9/10)
"""

from __future__ import annotations

from dataclasses import dataclass

from app.adapters.grok_client import generate_text
from app.adapters.llm_types import LlmGenerationResult
from app.prompts.summarize import SUMMARIZE_SYSTEM_PROMPT, build_summarize_user_prompt
from app.services.preprocessing import clean_text

MIN_CLEANED_LENGTH = 50
SUMMARY_TEMPERATURE = 0.2
SUMMARY_MAX_OUTPUT_TOKENS = 512


@dataclass(frozen=True)
class SummarizeResult:
    summary: str
    original_length: int
    cleaned_length: int
    summary_length: int
    model: str
    latency_ms: int
    prompt_tokens: int | None
    output_tokens: int | None


def summarize_article(text: str) -> SummarizeResult:
    """Generate an abstractive summary for a news article.

    Input: raw article string (may contain HTML)
    Output: SummarizeResult with summary and metadata

    Why preprocess first:
      Cleaner input → fewer tokens → better summary quality.
    """
    preprocess = clean_text(text)
    cleaned = preprocess.cleaned_text

    if len(cleaned) < MIN_CLEANED_LENGTH:
        raise ValueError(
            f"Article too short after preprocessing ({len(cleaned)} chars). "
            f"Need at least {MIN_CLEANED_LENGTH}."
        )

    llm_result: LlmGenerationResult = generate_text(
        user_prompt=build_summarize_user_prompt(cleaned),
        system_instruction=SUMMARIZE_SYSTEM_PROMPT,
        temperature=SUMMARY_TEMPERATURE,
        max_output_tokens=SUMMARY_MAX_OUTPUT_TOKENS,
    )

    summary = llm_result.text.strip()
    if not summary:
        raise RuntimeError("LLM returned an empty summary.")

    return SummarizeResult(
        summary=summary,
        original_length=len(text),
        cleaned_length=len(cleaned),
        summary_length=len(summary),
        model=llm_result.model,
        latency_ms=llm_result.latency_ms,
        prompt_tokens=llm_result.prompt_tokens,
        output_tokens=llm_result.output_tokens,
    )
