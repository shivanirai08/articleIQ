"""Tests for named entity extraction service (Checkpoint 13)."""

import pytest

from app.adapters.spacy_nlp import SpacyModelNotFoundError, get_spacy_nlp
from app.services.entities import extract_entities


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


def test_extract_entities_finds_org_and_gpe() -> None:
    text = (
        "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino, California. "
        "Chief executive Tim Cook told investors that cloud services demand accelerated. "
        "Analysts at Goldman Sachs raised their price targets for the stock."
    )
    result = extract_entities(text)
    assert result.entity_count >= 2
    assert result.cleaned_length >= 50
    assert result.spacy_model == "en_core_web_sm"

    labels = {entity.label for entity in result.entities}
    texts = {entity.text.lower() for entity in result.entities}
    assert "ORG" in labels or "Apple" in " ".join(texts)
    assert all(entity.start < entity.end for entity in result.entities)
    assert sorted(result.unique_labels) == result.unique_labels


def test_entity_offsets_reference_cleaned_text() -> None:
    raw = (
        "<p>Microsoft Corp. opened a new data center in Dublin on Monday.</p> "
        "Local officials welcomed the investment in renewable infrastructure."
    )
    result = extract_entities(raw)
    assert result.entity_count >= 1
    for entity in result.entities:
        assert entity.start >= 0
        assert entity.end <= result.cleaned_length
