"""Schemas for POST /api/v1/entities (problem statement — implemented CP13)."""

from pydantic import BaseModel, Field

from app.schemas.common import ArticleTextRequest


class EntitiesRequest(ArticleTextRequest):
    """Request body for named entity recognition."""


class EntityItem(BaseModel):
    text: str = Field(..., description="Surface form in the article")
    label: str = Field(..., description="Entity type e.g. PERSON, ORG, GPE")
    start: int = Field(..., ge=0, description="Character offset start")
    end: int = Field(..., ge=0, description="Character offset end (exclusive)")


class EntitiesResponse(BaseModel):
    entities: list[EntityItem]
    spacy_model: str
    original_length: int = Field(..., ge=0)
    cleaned_length: int = Field(..., ge=0)
    entity_count: int = Field(..., ge=0)
    unique_labels: list[str] = Field(
        default_factory=list,
        description="Distinct entity types found (e.g. PERSON, ORG, GPE)",
    )
