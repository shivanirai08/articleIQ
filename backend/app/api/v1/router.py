"""Aggregates all v1 routers."""

from fastapi import APIRouter

from app.api.v1 import preprocess, validate

api_router = APIRouter()

api_router.include_router(validate.router)
api_router.include_router(preprocess.router)


@api_router.get("/ping", tags=["system"])
def ping() -> dict[str, str]:
    """Lightweight versioned ping under /api/v1/ping."""
    return {"message": "pong"}
