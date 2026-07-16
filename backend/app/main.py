"""FastAPI application entrypoint for ArticleIQ.

Uvicorn loads this module via: `uvicorn app.main:app --reload`
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.schemas import HealthResponse


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = get_settings()

    application = FastAPI(
        title=settings.app_name,
        description=(
            "Intelligent News Summarization, Sentiment Analysis & "
            "Question Answering API (NLP + LLMs)."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/", tags=["system"])
    def root() -> dict[str, str]:
        return {
            "service": settings.app_name,
            "status": "running",
            "docs": "/docs",
            "health": "/health",
            "api_prefix": settings.api_prefix,
        }

    @application.get("/health", response_model=HealthResponse, tags=["system"])
    def health() -> HealthResponse:
        """Liveness + safe config flags (never exposes secrets)."""
        return HealthResponse(
            status="ok",
            service=settings.app_name,
            environment=settings.app_env,
            llm_configured=settings.llm_configured,
        )

    application.include_router(api_router, prefix=settings.api_prefix)

    return application


app = create_app()
