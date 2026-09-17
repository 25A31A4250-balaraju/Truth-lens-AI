"""Pydantic schemas for Analysis request, response, and metadata."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ImageMetadata(BaseModel):
    filename: str
    file_hash: str
    media_type: str
    file_size_bytes: int
    width: int
    height: int
    aspect_ratio: float


class ModelPredictionSchema(BaseModel):
    model_name: str
    model_version: str
    prediction: str
    confidence: float
    processing_time_ms: float
    status: str
    error_message: Optional[str] = None

    model_config = {"from_attributes": True}


class EvidenceItemSchema(BaseModel):
    evidence_type: str
    score: float
    description: str
    source_model: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RegionSchema(BaseModel):
    x: int
    y: int
    width: int
    height: int
    region_score: float
    region_type: str

    model_config = {"from_attributes": True}


class RobustnessTestSchema(BaseModel):
    transformation: str
    parameter: str
    prediction: str
    score_delta: float
    uncertainty_delta: float
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class RobustnessLabResponse(BaseModel):
    analysis_uuid: str
    stability_index: float
    stability_label: str
    tests: List[RobustnessTestSchema]


class AnalysisResponse(BaseModel):
    id: int
    uuid: str
    filename: str
    stored_path: str
    file_hash: str
    media_type: str
    file_size_bytes: int
    width: int
    height: int
    overall_verdict: str
    overall_score: float
    uncertainty_score: float
    uncertainty_label: str
    image_quality_score: Optional[float] = None
    image_quality_label: Optional[str] = None
    face_count: int
    processing_time_ms: float
    analysis_mode: str
    fft_path: Optional[str] = None
    created_at: datetime

    model_predictions: List[ModelPredictionSchema] = []
    evidence_items: List[EvidenceItemSchema] = []
    regions: List[RegionSchema] = []
    robustness_tests: List[RobustnessTestSchema] = []

    model_config = {"from_attributes": True}


class AnalysisListItem(BaseModel):
    uuid: str
    filename: str
    file_hash: str
    overall_verdict: str
    overall_score: float
    uncertainty_label: str
    processing_time_ms: float
    created_at: datetime

    model_config = {"from_attributes": True}
