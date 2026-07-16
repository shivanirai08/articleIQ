"""POST /api/v1/validate-article — contract validation demo (Checkpoint 6).

Why POST instead of GET:
  Article text is too long and sensitive for URL query strings.
  POST carries JSON in the request body safely.

Not yet NLP — proves Pydantic validation + shared contract before CP7+.
"""

from fastapi import APIRouter

from app.schemas import ArticleTextRequest, ValidateArticleResponse

router = APIRouter()


@router.post(
    "/validate-article",
    response_model=ValidateArticleResponse,
    summary="Validate article text payload",
    tags=["contracts"],
)
def validate_article(body: ArticleTextRequest) -> ValidateArticleResponse:
    """Accept article text; return counts if validation passes.

    FastAPI returns HTTP 422 automatically if text is too short/long.
    """
    word_count = len(body.text.split())
    return ValidateArticleResponse(
        valid=True,
        character_count=len(body.text),
        word_count=word_count,
    )
