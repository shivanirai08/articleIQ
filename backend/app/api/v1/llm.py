"""POST /api/v1/llm/demo — Gemini integration test (Checkpoint 9)."""

from fastapi import APIRouter, HTTPException, status

from app.adapters.gemini_client import GeminiNotConfiguredError
from app.core.config import get_settings
from app.schemas.llm import LlmDemoRequest, LlmDemoResponse
from app.services.llm import run_integration_demo

router = APIRouter(prefix="/llm", tags=["llm"])


@router.post(
    "/demo",
    response_model=LlmDemoResponse,
    summary="Test Gemini LLM integration",
)
def llm_demo(body: LlmDemoRequest) -> LlmDemoResponse:
    """Send a short message to Gemini and return the reply + metadata.

    Why POST: message body in JSON (not URL).

    Status codes:
      200 — Gemini replied successfully
      503 — GEMINI_API_KEY not configured on server
      502 — Gemini API error or empty response
    """
    settings = get_settings()

    try:
        result = run_integration_demo(body.message)
    except GeminiNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini request failed: {exc}",
        ) from exc

    return LlmDemoResponse(
        model=result.model,
        reply=result.text,
        latency_ms=result.latency_ms,
        prompt_tokens=result.prompt_tokens,
        output_tokens=result.output_tokens,
        total_tokens=result.total_tokens,
        temperature=settings.gemini_temperature,
        max_output_tokens=settings.gemini_max_output_tokens,
    )
