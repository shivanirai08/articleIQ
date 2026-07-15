"""FastAPI application entrypoint for ArticleIQ.

Uvicorn loads this module via: `uvicorn app.main:app --reload`

Why this file exists:
  Single ASGI application object (`app`) that the server can serve.

Who imports this:
  Uvicorn / process managers — not the frontend directly.

What happens if removed:
  The API process cannot start.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core import config


def create_app() -> FastAPI:
    """Build and configure the FastAPI application.

    Using a factory function (instead of only module-level code) makes testing
    easier later: tests can call create_app() without importing side effects.
    """
    application = FastAPI(
        title=config.APP_NAME,
        description=(
            "Intelligent News Summarization, Sentiment Analysis & "
            "Question Answering API (NLP + LLMs)."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS = Cross-Origin Resource Sharing.
    # Browser JS on http://localhost:3000 calling http://localhost:8000 is
    # cross-origin. Without these headers, the browser blocks the response.
    application.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/", tags=["system"])
    def root() -> dict[str, str]:
        """Human-friendly landing JSON for the API root."""
        return {
            "service": config.APP_NAME,
            "status": "running",
            "docs": "/docs",
            "health": "/health",
            "api_prefix": config.API_PREFIX,
        }

    @application.get("/health", tags=["system"])
    def health() -> dict[str, str]:
        """Liveness check for local runs and (later) deploy platforms.

        Why GET (not POST): health checks are safe, cacheable reads with no body.
        """
        return {
            "status": "ok",
            "service": config.APP_NAME,
            "environment": config.APP_ENV,
        }

    # Mount versioned business API: /api/v1/...
    application.include_router(api_router, prefix=config.API_PREFIX)

    return application


# ASGI callable discovered by Uvicorn as `app.main:app`
app = create_app()
