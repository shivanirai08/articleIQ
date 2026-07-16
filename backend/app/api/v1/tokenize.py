"""POST /api/v1/tokenize — spaCy tokenization & sentence segmentation (Checkpoint 8)."""

from fastapi import APIRouter, HTTPException, status

from app.adapters.spacy_nlp import SpacyModelNotFoundError
from app.schemas import TokenizeRequest, TokenizeResponse
from app.schemas.tokenize import SentenceItem, TokenItem
from app.services.nlp import analyze_text

router = APIRouter()


@router.post(
    "/tokenize",
    response_model=TokenizeResponse,
    summary="Tokenize and segment sentences with spaCy",
    tags=["nlp"],
)
def tokenize_article(body: TokenizeRequest) -> TokenizeResponse:
    """Run preprocessing + spaCy pipeline on article text.

    Why POST: article body in JSON (same rationale as preprocess).

    Status codes:
      200 — success
      422 — validation error on raw text
      503 — spaCy model not installed on server
    """
    try:
        result = analyze_text(body.text)
    except SpacyModelNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return TokenizeResponse(
        spacy_model=result.spacy_model,
        cleaned_character_count=result.cleaned_character_count,
        token_count=result.token_count,
        sentence_count=result.sentence_count,
        sentences=[
            SentenceItem(
                index=s.index,
                text=s.text,
                start_char=s.start_char,
                end_char=s.end_char,
            )
            for s in result.sentences
        ],
        tokens=[
            TokenItem(
                index=t.index,
                text=t.text,
                lemma=t.lemma,
                pos=t.pos,
                is_alpha=t.is_alpha,
                is_stop=t.is_stop,
            )
            for t in result.tokens
        ],
        tokens_truncated=result.tokens_truncated,
    )
