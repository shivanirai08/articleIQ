"""spaCy adapter — loads and caches the English NLP pipeline.

Why an adapter:
  Services should not import spaCy directly everywhere. This file is the only
  place that knows how to load the model — easy to swap or mock in tests.

Who imports this:
  app.services.nlp

What happens if removed:
  No classical NLP; NER/keywords in later checkpoints break.
"""

from __future__ import annotations

from functools import lru_cache

import spacy
from spacy.language import Language

from app.core.config import get_settings


class SpacyModelNotFoundError(RuntimeError):
    """Raised when the configured spaCy model is not installed locally."""


@lru_cache
def get_spacy_nlp() -> Language:
    """Load and cache the spaCy Language pipeline (singleton per process).

    First call downloads nothing — you must run:
      python -m spacy download en_core_web_sm

    Time complexity: O(1) after first load (model load is expensive once).
    Space complexity: O(model size) — tens of MB for en_core_web_sm.
    """
    model_name = get_settings().spacy_model
    try:
        return spacy.load(model_name)
    except OSError as exc:
        raise SpacyModelNotFoundError(
            f"spaCy model '{model_name}' is not installed. "
            f"Run: python -m spacy download {model_name}"
        ) from exc


def clear_spacy_cache() -> None:
    """Clear cached pipeline — useful in tests."""
    get_spacy_nlp.cache_clear()
