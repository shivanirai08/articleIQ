"""LLM orchestration service (Checkpoint 9).

Purpose:
  High-level functions that combine prompts + Gemini adapter.
  Feature services (summarize, sentiment, qa) will call this layer in later checkpoints.
"""

from __future__ import annotations

from app.adapters.gemini_client import LlmGenerationResult, generate_text
from app.prompts.demo import build_demo_user_prompt
from app.prompts.system import ARTICLEIQ_SYSTEM_PROMPT


def run_integration_demo(user_message: str) -> LlmGenerationResult:
    """Send a demo message to Gemini to verify LLM integration.

    Used by POST /api/v1/llm/demo — not a production feature endpoint.
    """
    user_prompt = build_demo_user_prompt(user_message)
    return generate_text(
        user_prompt=user_prompt,
        system_instruction=ARTICLEIQ_SYSTEM_PROMPT,
    )
