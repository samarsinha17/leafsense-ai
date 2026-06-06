from datetime import datetime
from pydantic import BaseModel, Field


class Recommendation(BaseModel):
    explanation: str
    symptoms: list[str]
    causes: list[str]
    immediateActions: list[str]
    organicTreatment: list[str]
    chemicalTreatment: list[str]
    preventiveMeasures: list[str]
    wateringGuidance: str
    fertilizerAdvice: str
    farmerSummary: str


class PredictionResponse(BaseModel):
    id: str
    imageUrl: str
    cropName: str
    diseaseName: str
    scientificName: str
    diseaseCategory: str
    confidenceScore: float = Field(ge=0, le=100)
    infectedArea: float = Field(ge=0, le=100)
    severity: str
    timestamp: datetime
    heatmapUrl: str | None = None
    highlightedUrl: str | None = None
    topPredictions: list[dict[str, float | str]] = Field(default_factory=list)
    recommendation: Recommendation
