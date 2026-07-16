"""Keyword extraction use-case (Objective O4 — Checkpoint 12).

Classical NLP pipeline (no LLM):
  raw article → preprocess (CP7) → spaCy (CP8) → noun chunks + NOUN/PROPN
  → term-frequency ranking → top-k keywords

Why classical NLP here (vs LLM like O2/O3):
  Keywords should be explainable and cheap — frequency + POS tags are auditable.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass

from app.adapters.spacy_nlp import get_spacy_nlp
from app.core.config import get_settings
from app.services.preprocessing import clean_text

DEFAULT_KEYWORD_LIMIT = 10
MIN_TOKEN_LENGTH = 3
PHRASE_SCORE_BOOST = 1.25


@dataclass(frozen=True)
class RankedKeyword:
    keyword: str
    score: float


@dataclass(frozen=True)
class KeywordsResult:
    keywords: list[RankedKeyword]
    spacy_model: str
    original_length: int
    cleaned_length: int
    candidate_count: int


def _normalize_key(text: str) -> str:
    """Lowercase + collapse whitespace for deduplication."""
    return " ".join(text.lower().split())


def _is_valid_noun_chunk(text: str, *, has_content_token: bool) -> bool:
    normalized = _normalize_key(text)
    if len(normalized) < MIN_TOKEN_LENGTH:
        return False
    if not has_content_token:
        return False
    return True


def _pick_display(current: str, candidate: str) -> str:
    """Prefer longer surface form for readability (e.g. 'Apple Inc.' over 'apple')."""
    current = current.strip()
    candidate = candidate.strip()
    if len(candidate) > len(current):
        return candidate
    return current


def extract_keywords(text: str, limit: int = DEFAULT_KEYWORD_LIMIT) -> KeywordsResult:
    """Extract top keywords from a news article using spaCy linguistic features.

    Ranking strategy (single-document TF):
      1. Noun chunks (multi-word phrases) — boosted score
      2. Fallback PROPN/NOUN lemmas if we need more candidates
      3. Sort by score desc, then keyword length desc (specificity tie-break)
    """
    settings = get_settings()
    cleaned = clean_text(text).cleaned_text
    doc = get_spacy_nlp()(cleaned)

    scores: dict[str, float] = defaultdict(float)
    displays: dict[str, str] = {}
    chunk_lemmas: set[str] = set()

    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.strip()
        has_content = any(not token.is_stop and token.is_alpha for token in chunk)
        if not _is_valid_noun_chunk(chunk_text, has_content_token=has_content):
            continue

        key = _normalize_key(chunk_text)
        scores[key] += PHRASE_SCORE_BOOST
        displays[key] = _pick_display(displays.get(key, chunk_text), chunk_text)
        chunk_lemmas.update(token.lemma_.lower() for token in chunk if token.is_alpha)

    for token in doc:
        if not token.is_alpha or token.is_stop:
            continue
        if token.pos_ not in {"NOUN", "PROPN"}:
            continue
        if len(token.text) < MIN_TOKEN_LENGTH:
            continue

        lemma_key = token.lemma_.lower()
        if lemma_key in chunk_lemmas:
            continue

        scores[lemma_key] += 1.0
        displays[lemma_key] = _pick_display(displays.get(lemma_key, token.text), token.text)

    ranked = sorted(
        (
            RankedKeyword(keyword=displays[key], score=round(score, 4))
            for key, score in scores.items()
        ),
        key=lambda item: (item.score, len(item.keyword)),
        reverse=True,
    )

    max_score = ranked[0].score if ranked else 1.0
    normalized_ranked = [
        RankedKeyword(
            keyword=item.keyword,
            score=round(item.score / max_score, 4) if max_score else item.score,
        )
        for item in ranked[:limit]
    ]

    return KeywordsResult(
        keywords=normalized_ranked,
        spacy_model=settings.spacy_model,
        original_length=len(text),
        cleaned_length=len(cleaned),
        candidate_count=len(scores),
    )
