"""POST /api/v1/summarize — concise news summaries (Objective O2).

Why POST:
  Article text is long; JSON body is the correct transport.

Prompt engineering:
  See app/prompts/summarize.py for system prompt, delimiters, and constraints.
"""

from fastapi import APIRouter, HTTPException, status

from app.adapters.grok_client import GrokNotConfiguredError
from app.schemas import SummarizeRequest, SummarizeResponse
from app.services.summarize import summarize_article

router = APIRouter()


@router.post(
    "/summarize",
    response_model=SummarizeResponse,
    summary="Generate abstractive news summary",
    tags=["llm"],
)
def summarize(body: SummarizeRequest) -> SummarizeResponse:
    """Summarize a news article using preprocessing + LLM.

    Status codes:
      200 — summary generated
      400 — article too short after cleaning
      422 — Pydantic validation failed on raw input
      503 — GROK_API_KEY not configured
      502 — LLM error
    """
    try:
        result = summarize_article(body.text)
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
            detail=f"Summarization failed: {exc}",
        ) from exc

    return SummarizeResponse(
        summary=result.summary,
        original_length=result.original_length,
        cleaned_length=result.cleaned_length,
        summary_length=result.summary_length,
        model=result.model,
        latency_ms=result.latency_ms,
        prompt_tokens=result.prompt_tokens,
        output_tokens=result.output_tokens,
    )
