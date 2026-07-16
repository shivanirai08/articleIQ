"""POST /api/v1/entities — named entity recognition (Objective O4).

Classical NLP (spaCy) — no LLM required.
"""

from fastapi import APIRouter, HTTPException, status

from app.adapters.spacy_nlp import SpacyModelNotFoundError
from app.schemas import EntitiesRequest, EntitiesResponse, EntityItem
from app.services.entities import extract_entities

router = APIRouter()


@router.post(
    "/entities",
    response_model=EntitiesResponse,
    summary="Extract named entities with spaCy NER",
    tags=["nlp"],
)
def entities(body: EntitiesRequest) -> EntitiesResponse:
    """Recognize named entities (PERSON, ORG, GPE, DATE, etc.) in article text.

    Character offsets are relative to the cleaned text after preprocessing.

    Status codes:
      200 — entities extracted
      422 — validation error on raw text
      503 — spaCy model not installed
    """
    try:
        result = extract_entities(body.text)
    except SpacyModelNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return EntitiesResponse(
        entities=[
            EntityItem(
                text=item.text,
                label=item.label,
                start=item.start,
                end=item.end,
            )
            for item in result.entities
        ],
        spacy_model=result.spacy_model,
        original_length=result.original_length,
        cleaned_length=result.cleaned_length,
        entity_count=result.entity_count,
        unique_labels=result.unique_labels,
    )
