"""POST /api/v1/sentiment — sentiment detection (Objective O3).

Why POST:
  Article text is long; JSON body is the correct transport.

Prompt engineering:
  See app/prompts/sentiment.py for structured JSON output instructions.
"""

from fastapi import APIRouter, HTTPException, status

from app.adapters.grok_client import GrokNotConfiguredError
from app.schemas import SentimentRequest, SentimentResponse
from app.services.sentiment import analyze_sentiment

router = APIRouter()


@router.post(
    "/sentiment",
    response_model=SentimentResponse,
    summary="Detect news article sentiment",
    tags=["llm"],
)
def sentiment(body: SentimentRequest) -> SentimentResponse:
    """Classify article sentiment using preprocessing + LLM.

    Status codes:
      200 — sentiment classified
      400 — article too short or unparseable LLM JSON
      422 — Pydantic validation failed on raw input
      503 — GROK_API_KEY not configured
      502 — LLM error
    """
    try:
        result = analyze_sentiment(body.text)
    except GrokNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Sentiment analysis failed: {exc}",
        ) from exc

    return SentimentResponse(
        label=result.label,
        confidence=result.confidence,
        rationale=result.rationale,
        original_length=result.original_length,
        cleaned_length=result.cleaned_length,
        model=result.model,
        latency_ms=result.latency_ms,
        prompt_tokens=result.prompt_tokens,
        output_tokens=result.output_tokens,
    )
