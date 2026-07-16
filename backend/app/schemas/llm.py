"""Schemas for POST /api/v1/llm/demo (Checkpoint 9 — Gemini integration)."""

from pydantic import BaseModel, Field


class LlmDemoRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Short message to send to Gemini for integration testing",
        examples=["What is sentiment analysis in news?"],
    )


class LlmDemoResponse(BaseModel):
    model: str
    reply: str
    latency_ms: int = Field(..., ge=0, description="Round-trip time in milliseconds")
    prompt_tokens: int | None = Field(
        default=None,
        description="Input tokens billed by Gemini (if reported)",
    )
    output_tokens: int | None = Field(
        default=None,
        description="Output tokens generated (if reported)",
    )
    total_tokens: int | None = None
    temperature: float = Field(..., description="Temperature used for this request")
    max_output_tokens: int = Field(..., description="Cap on generated tokens")
