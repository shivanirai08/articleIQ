"""POST /api/v1/keywords — important keyword extraction (Objective O4).

Classical NLP (spaCy) — no LLM required.
"""

from fastapi import APIRouter, HTTPException, status

from app.adapters.spacy_nlp import SpacyModelNotFoundError
from app.schemas import KeywordItem, KeywordsRequest, KeywordsResponse
from app.services.keywords import extract_keywords

router = APIRouter()


@router.post(
    "/keywords",
    response_model=KeywordsResponse,
    summary="Extract important keywords with spaCy",
    tags=["nlp"],
)
def keywords(body: KeywordsRequest) -> KeywordsResponse:
    """Rank keywords from article text using noun chunks and term frequency.

    Status codes:
      200 — keywords extracted
      422 — validation error on raw text or limit
      503 — spaCy model not installed
    """
    try:
        result = extract_keywords(body.text, limit=body.limit)
    except SpacyModelNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return KeywordsResponse(
        keywords=[
            KeywordItem(keyword=item.keyword, score=item.score)
            for item in result.keywords
        ],
        spacy_model=result.spacy_model,
        original_length=result.original_length,
        cleaned_length=result.cleaned_length,
        candidate_count=result.candidate_count,
        limit=body.limit,
    )
