"""Unit tests for spaCy NLP analysis (Checkpoint 8)."""

import pytest

from app.adapters.spacy_nlp import SpacyModelNotFoundError, get_spacy_nlp
from app.services.nlp import analyze_text


def _spacy_model_installed() -> bool:
    try:
        get_spacy_nlp()
        return True
    except SpacyModelNotFoundError:
        return False


pytestmark = pytest.mark.skipif(
    not _spacy_model_installed(),
    reason="spaCy model en_core_web_sm not installed",
)


def test_analyze_text_tokens_and_sentences() -> None:
    text = (
        "Apple Inc. announced record revenue on Tuesday. "
        "Investors welcomed the news from Cupertino."
    )
    result = analyze_text(text)
    assert result.token_count > 0
    assert result.sentence_count >= 2
    assert len(result.sentences) >= 2
    assert result.tokens[0].text
    assert result.spacy_model == "en_core_web_sm"


def test_preprocess_runs_before_spacy() -> None:
    raw = "<p>Markets rose today.</p> " + "Energy stocks gained ground."
    result = analyze_text(raw)
    assert result.token_count > 5
    assert all("<" not in token.text for token in result.tokens)
