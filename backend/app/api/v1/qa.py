"""POST /api/v1/qa — article-grounded Q&A via prompt engineering (Objective O5).

Open-book QA: the full article is provided in the prompt context.
"""

from fastapi import APIRouter, HTTPException, status

from app.adapters.grok_client import GrokNotConfiguredError
from app.schemas import QARequest, QAResponse
from app.services.qa import answer_question

router = APIRouter()


@router.post(
    "/qa",
    response_model=QAResponse,
    summary="Answer questions about a news article",
    tags=["llm"],
)
def qa(body: QARequest) -> QAResponse:
    """Answer a question using preprocessing + grounded LLM prompts.

    Status codes:
      200 — answer generated (grounded true or false)
      400 — article too short or unparseable LLM JSON
      422 — validation failed on text or question
      503 — GROK_API_KEY not configured
      502 — LLM error
    """
    try:
        result = answer_question(body.text, body.question)
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
            detail=f"Question answering failed: {exc}",
        ) from exc

    return QAResponse(
        answer=result.answer,
        grounded=result.grounded,
        question=result.question,
        original_length=result.original_length,
        cleaned_length=result.cleaned_length,
        model=result.model,
        latency_ms=result.latency_ms,
        prompt_tokens=result.prompt_tokens,
        output_tokens=result.output_tokens,
    )
