"""LLM orchestration service — uses Grok/Groq adapter."""

from __future__ import annotations

from app.adapters.grok_client import generate_text
from app.adapters.llm_types import LlmGenerationResult
from app.prompts.demo import build_demo_user_prompt
from app.prompts.system import ARTICLEIQ_SYSTEM_PROMPT


def run_integration_demo(user_message: str) -> LlmGenerationResult:
    """Send a demo message to the configured LLM (Groq or xAI Grok)."""
    user_prompt = build_demo_user_prompt(user_message)
    return generate_text(
        user_prompt=user_prompt,
        system_instruction=ARTICLEIQ_SYSTEM_PROMPT,
    )
