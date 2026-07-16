"""POST /api/v1/preprocess — NLP text preprocessing (Objective O1)."""

from fastapi import APIRouter, HTTPException, status

from app.schemas import PreprocessRequest, PreprocessResponse
from app.services.preprocessing import clean_text

router = APIRouter()

# After cleaning, text must still meet minimum article length for downstream NLP.
MIN_CLEANED_LENGTH = 50


@router.post(
    "/preprocess",
    response_model=PreprocessResponse,
    summary="Clean and normalize article text",
    tags=["nlp"],
)
def preprocess_article(body: PreprocessRequest) -> PreprocessResponse:
    """Run the preprocessing pipeline on raw article text.

    Why POST: article body is too long for GET query strings.

    Request body: PreprocessRequest (ArticleTextRequest)
    Response: PreprocessResponse with cleaned text + metadata

    Status codes:
      200 — success
      422 — raw text failed Pydantic validation (too short/long before clean)
      400 — text too short after cleaning (user pasted mostly noise/HTML)
    """
    result = clean_text(body.text)

    if result.cleaned_character_count < MIN_CLEANED_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Text too short after preprocessing ({result.cleaned_character_count} "
                f"chars). Need at least {MIN_CLEANED_LENGTH} characters of meaningful content."
            ),
        )

    return PreprocessResponse(
        cleaned_text=result.cleaned_text,
        original_character_count=result.original_character_count,
        cleaned_character_count=result.cleaned_character_count,
        word_count=result.word_count,
        transformations_applied=result.transformations_applied,
    )
