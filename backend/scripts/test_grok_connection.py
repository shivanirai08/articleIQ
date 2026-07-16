#!/usr/bin/env python3
"""Test GROK_API_KEY connectivity (Groq or xAI Grok).

Usage:
  cd backend && source .venv/bin/activate
  python scripts/test_grok_connection.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# Allow `python scripts/test_grok_connection.py` from backend/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import dotenv_values


def main() -> int:
    vals = dotenv_values(".env")
    key = (vals.get("GROK_API_KEY") or "").strip()
    if not key:
        print("FAIL: GROK_API_KEY missing in backend/.env")
        return 1

    if key.startswith("gsk_"):
        print("Detected: Groq API key (gsk_...)")
    elif key.startswith("xai-"):
        print("Detected: xAI Grok API key (xai-...)")
    else:
        print("WARN: Unknown key prefix — will try Groq base URL first")

    try:
        from app.core.config import clear_settings_cache, get_settings

        clear_settings_cache()
        settings = get_settings()
        from app.adapters.grok_client import clear_grok_client_cache, generate_text

        clear_grok_client_cache()
        result = generate_text(
            user_prompt="Reply with exactly: ArticleIQ Grok OK",
            system_instruction="You are a helpful assistant. Be brief.",
            max_output_tokens=32,
        )
        print("OK: LLM responded")
        print(f"provider: {settings.llm_provider}")
        print(f"base_url: {settings.resolved_llm_base_url}")
        print(f"model: {result.model}")
        print(f"reply: {result.text[:120]}")
        print(
            f"tokens: in={result.prompt_tokens} out={result.output_tokens} "
            f"latency={result.latency_ms}ms"
        )
        return 0
    except Exception as exc:
        print(f"FAIL: {type(exc).__name__}: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
