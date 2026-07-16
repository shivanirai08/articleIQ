"""Prompt templates for news summarization (Objective O2 — Checkpoint 10).

Prompt engineering techniques used:
  1. Role prompting — "expert news editor"
  2. Constraint prompting — length, format, no hallucination
  3. Delimiter pattern — wrap article in clear markers
  4. Zero-shot — no examples needed (few-shot possible later)
"""

SUMMARIZE_SYSTEM_PROMPT = """You are an expert news editor working inside ArticleIQ.

Your task is to write concise, accurate summaries of news articles for busy readers.

Rules:
- Output ONLY the summary text (no title, no bullet labels, no preamble).
- Use 3 to 5 complete sentences.
- Preserve key facts: who, what, when, where, and why (if stated).
- Do not add opinions, predictions, or facts not present in the article.
- Use neutral, journalistic language.
- If the article is unclear, summarize only what is explicitly stated.
"""

SUMMARY_MAX_SENTENCES = 5


def build_summarize_user_prompt(article_text: str) -> str:
    """Build the user prompt with delimited article content.

    Delimiter technique reduces the model confusing instructions with content.
    """
    return (
        "Summarize the following news article.\n\n"
        "=== ARTICLE START ===\n"
        f"{article_text.strip()}\n"
        "=== ARTICLE END ===\n\n"
        f"Write a {SUMMARY_MAX_SENTENCES}-sentence summary following the system rules."
    )
