"""POST /api/v1/llm/demo — Grok/Groq LLM integration test."""

from fastapi import APIRouter, HTTPException, status

from app.adapters.grok_client import GrokNotConfiguredError
from app.core.config import get_settings
from app.schemas.llm import LlmDemoRequest, LlmDemoResponse
from app.services.llm import run_integration_demo

router = APIRouter(prefix="/llm", tags=["llm"])


@router.post(
    "/demo",
    response_model=LlmDemoResponse,
    summary="Test Grok/Groq LLM integration",
)
def llm_demo(body: LlmDemoRequest) -> LlmDemoResponse:
    """Send a short message to the LLM and return the reply + metadata."""
    settings = get_settings()

    try:
        result = run_integration_demo(body.message)
    except GrokNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM request failed: {exc}",
        ) from exc

    return LlmDemoResponse(
        model=result.model,
        reply=result.text,
        latency_ms=result.latency_ms,
        prompt_tokens=result.prompt_tokens,
        output_tokens=result.output_tokens,
        total_tokens=result.total_tokens,
        temperature=settings.llm_temperature,
        max_output_tokens=settings.llm_max_output_tokens,
    )
