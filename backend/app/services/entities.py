"""Named entity extraction use-case (Objective O4 — Checkpoint 13).

Classical NLP pipeline (no LLM):
  raw article → preprocess (CP7) → spaCy NER (doc.ents) → entity spans

NER vs keywords (CP12):
  Keywords = topical terms/phrases (what the article discusses).
  Entities = named things with types (who/where/when) and character spans.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.adapters.spacy_nlp import get_spacy_nlp
from app.core.config import get_settings
from app.services.preprocessing import clean_text


@dataclass(frozen=True)
class EntitySpan:
    text: str
    label: str
    start: int
    end: int


@dataclass(frozen=True)
class EntitiesResult:
    entities: list[EntitySpan]
    spacy_model: str
    original_length: int
    cleaned_length: int
    entity_count: int
    unique_labels: list[str]


def extract_entities(text: str) -> EntitiesResult:
    """Extract named entities from a news article using spaCy NER.

    Offsets (start/end) refer to the **cleaned** article text — the same string
    passed to spaCy after preprocessing — not the raw HTML input.
    """
    settings = get_settings()
    cleaned = clean_text(text).cleaned_text
    doc = get_spacy_nlp()(cleaned)

    entities = [
        EntitySpan(
            text=ent.text.strip(),
            label=ent.label_,
            start=ent.start_char,
            end=ent.end_char,
        )
        for ent in doc.ents
        if ent.text.strip()
    ]

    labels = sorted({entity.label for entity in entities})

    return EntitiesResult(
        entities=entities,
        spacy_model=settings.spacy_model,
        original_length=len(text),
        cleaned_length=len(cleaned),
        entity_count=len(entities),
        unique_labels=labels,
    )
