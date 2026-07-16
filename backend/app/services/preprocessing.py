"""NLP text preprocessing pipeline (Objective O1).

Purpose:
  Transform raw pasted article text into clean plain text suitable for spaCy
  and LLM pipelines.

Why before summarization/sentiment:
  Garbage in → garbage out. HTML noise, odd whitespace, and control characters
  confuse tokenizers and waste LLM context window tokens.

Who calls this:
  API route POST /api/v1/preprocess (Checkpoint 7)
  Later: summarize, sentiment, keywords, entities, qa, analyze services.

Real-world analogy:
  Washing vegetables before cooking — you do not season mud.
"""

from __future__ import annotations

import html
import re
import unicodedata
from dataclasses import dataclass


@dataclass(frozen=True)
class PreprocessResult:
    """Output of the cleaning pipeline."""

    cleaned_text: str
    original_character_count: int
    cleaned_character_count: int
    word_count: int
    transformations_applied: list[str]


_HTML_TAG_PATTERN = re.compile(r"<[^>]+>")
_HAS_HTML_ENTITY = re.compile(r"&(?:#x?[0-9a-fA-F]+|[a-zA-Z]+);")


def strip_html_tags(text: str) -> str:
    """Remove HTML/XML tags, replacing them with a space.

    Example: '<p>Hello</p>' → ' Hello '
    """
    return _HTML_TAG_PATTERN.sub(" ", text)


def decode_html_entities(text: str) -> str:
    """Decode entities like &amp; &lt; &#8217; into real characters."""
    return html.unescape(text)


def normalize_unicode(text: str) -> str:
    """Unicode NFKC normalization — compat characters → standard forms.

    Example: full-width digits, ligatures, compatibility variants.
    """
    return unicodedata.normalize("NFKC", text)


def remove_control_characters(text: str) -> str:
    """Drop invisible control chars (except newline/tab)."""
    cleaned: list[str] = []
    for char in text:
        category = unicodedata.category(char)
        if category.startswith("C") and char not in "\n\t":
            continue
        cleaned.append(char)
    return "".join(cleaned)


def collapse_whitespace(text: str) -> str:
    """Normalize runs of spaces/tabs and excessive blank lines."""
    text = re.sub(r"[\t\r\f\v]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" +", " ", text)
    return text.strip()


def clean_text(text: str) -> PreprocessResult:
    """Run the full preprocessing pipeline on article text.

    Input:
      Raw string from user paste (may include HTML, odd spacing, etc.)

    Output:
      PreprocessResult with cleaned text and audit trail of steps applied.

    Execution flow:
      1. Strip HTML tags (if any)
      2. Decode HTML entities (if any)
      3. Unicode NFKC normalization
      4. Remove control characters
      5. Collapse whitespace

    Time complexity: O(n) where n = len(text) — each step scans the string.
    Space complexity: O(n) — intermediate strings.
    """
    original_count = len(text)
    transformations: list[str] = []
    result = text

    if _HTML_TAG_PATTERN.search(result):
        result = strip_html_tags(result)
        transformations.append("html_stripped")

    if _HAS_HTML_ENTITY.search(result):
        decoded = decode_html_entities(result)
        if decoded != result:
            transformations.append("html_entities_decoded")
        result = decoded

    normalized = normalize_unicode(result)
    if normalized != result:
        transformations.append("unicode_normalized")
    result = normalized

    without_controls = remove_control_characters(result)
    if without_controls != result:
        transformations.append("control_chars_removed")
    result = without_controls

    collapsed = collapse_whitespace(result)
    if collapsed != result:
        transformations.append("whitespace_normalized")
    result = collapsed

    word_count = len(result.split()) if result else 0

    return PreprocessResult(
        cleaned_text=result,
        original_character_count=original_count,
        cleaned_character_count=len(result),
        word_count=word_count,
        transformations_applied=transformations,
    )
