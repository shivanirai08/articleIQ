"""Aggregates all v1 routers into one APIRouter.

Checkpoint 3: empty aggregator (ready for future feature routers).
Checkpoint 6+: include summarize, sentiment, keywords, entities, qa, analyze.

Why this file exists:
  main.py should include ONE router, not six. Adding a feature = one include here.

Who imports this:
  app.main

Who will be imported by this (later):
  app.api.v1.summarize, sentiment, keywords, entities, qa, analyze
"""

from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/ping", tags=["system"])
def ping() -> dict[str, str]:
    """Lightweight versioned ping under /api/v1/ping.

    Purpose: prove the v1 router is mounted.
    Input: none
    Output: {"message": "pong"}
    """
    return {"message": "pong"}
