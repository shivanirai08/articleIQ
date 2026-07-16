"""Aggregates all v1 routers."""

from fastapi import APIRouter

from app.api.v1 import entities, keywords, llm, preprocess, qa, sentiment, summarize, tokenize, validate

api_router = APIRouter()

api_router.include_router(validate.router)
api_router.include_router(preprocess.router)
api_router.include_router(tokenize.router)
api_router.include_router(keywords.router)
api_router.include_router(entities.router)
api_router.include_router(llm.router)
api_router.include_router(summarize.router)
api_router.include_router(sentiment.router)
api_router.include_router(qa.router)


@api_router.get("/ping", tags=["system"])
def ping() -> dict[str, str]:
    """Lightweight versioned ping under /api/v1/ping."""
    return {"message": "pong"}
