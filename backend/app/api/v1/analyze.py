"""POST /api/v1/analyze — orchestrates preprocessing + NLP + LLM features.

Convenience endpoint for the interactive UI (Objective O6) so the frontend
can request a full analysis in one call when desired.
"""

from fastapi import APIRouter, HTTPException, status

from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.analyze import analyze_article

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Run full article analysis (summary, sentiment, keywords, entities)",
    tags=["orchestration"],
)
def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    """Orchestrate O2–O4 capabilities in one request with partial error support.

    Status codes:
      200 — at least one analysis section succeeded (check errors[] for partial failures)
      422 — validation error on raw text
      502 — every section failed
    """
    try:
        result = analyze_article(body.text, keyword_limit=body.keyword_limit)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    return AnalyzeResponse(
        summary=result.summary,
        sentiment=result.sentiment,
        keywords=result.keywords,
        entities=result.entities,
        errors=result.errors,
        total_latency_ms=result.total_latency_ms,
    )
