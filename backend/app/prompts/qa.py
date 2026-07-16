"""Prompt templates for grounded article Q&A (Objective O5 — Checkpoint 14).

Prompt engineering techniques used:
  1. Role prompting — "news research assistant"
  2. Grounding constraint — answer ONLY from delimited article
  3. Refusal behavior — admit when the article lacks evidence
  4. Structured output — JSON with answer + grounded flag
  5. Delimiter pattern — separate article from question
"""

QA_SYSTEM_PROMPT = """You are a news research assistant inside ArticleIQ.

Your task is to answer user questions using ONLY the provided news article text.

Rules:
- Use only facts explicitly stated or clearly implied in the article.
- If the article does not contain enough information, say so clearly in the answer
  and set grounded to false.
- Do not use outside knowledge, guesses, or speculation.
- Keep answers concise: 1 to 4 sentences.
- Output ONLY valid JSON (no markdown, no code fences, no extra commentary).
- Use this exact schema:
  {"answer": "<your answer>", "grounded": <true|false>}
- grounded is true when the answer is supported by the article; false when refusing
  or when the article lacks the requested information.
"""

QA_JSON_SCHEMA_HINT = (
    '{"answer": "The company reported eighteen percent revenue growth.", "grounded": true}'
)


def build_qa_user_prompt(article_text: str, question: str) -> str:
    """Build the user prompt with delimited article and explicit question."""
    return (
        "Answer the question using only the article below.\n\n"
        "=== ARTICLE START ===\n"
        f"{article_text.strip()}\n"
        "=== ARTICLE END ===\n\n"
        "=== QUESTION ===\n"
        f"{question.strip()}\n\n"
        "Respond with JSON only matching this shape:\n"
        f"{QA_JSON_SCHEMA_HINT}"
    )
