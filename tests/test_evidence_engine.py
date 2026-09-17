"""Tests for Evidence Engine and Model Disagreement Calibration."""

import io
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app
from backend.database.models import ModelPrediction
from backend.services.evidence_service import EvidenceService
from backend.services.quality_service import ImageQualityAssessment
from backend.services.frequency_service import FrequencyMetrics

client = TestClient(app)


def make_quality(overall_score: float = 0.85, label: str = "GOOD") -> ImageQualityAssessment:
    return ImageQualityAssessment(
        overall_score=overall_score,
        overall_label=label,
        sharpness_score=150.0,
        noise_level=2.5,
        contrast_score=60.0,
        brightness_score=120.0,
        clipping_pct=0.5,
        explanation="Synthetic test quality"
    )


def test_evidence_service_all_standby():
    preds = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="N/A", confidence=0.0, processing_time_ms=0.0, status="STANDBY_NO_CHECKPOINT"),
        ModelPrediction(model_name="LSDA", model_version="1.0", prediction="N/A", confidence=0.0, processing_time_ms=0.0, status="STANDBY_NO_CHECKPOINT"),
        ModelPrediction(model_name="F3Net", model_version="1.0", prediction="N/A", confidence=0.0, processing_time_ms=0.0, status="STANDBY_NO_CHECKPOINT")
    ]
    quality = make_quality()
    result = EvidenceService.calibrate_ensemble_evidence(preds, quality)

    assert result.overall_verdict == "UNCERTAIN"
    assert result.uncertainty_score >= 0.80
    assert result.uncertainty_label == "HIGH"
    assert result.consensus_label == "STANDBY"
    assert result.active_detectors_count == 0
    assert len(result.evidence_items) == 2
    types = [e.evidence_type for e in result.evidence_items]
    assert "CONSENSUS_ANALYSIS" in types
    assert "UNCERTAINTY_BREAKDOWN" in types


def test_evidence_service_high_consensus():
    # 3 models strongly agreeing on FAKE
    preds = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="FAKE", confidence=0.92, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="F3Net", model_version="1.0", prediction="FAKE", confidence=0.88, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="SBI", model_version="1.0", prediction="FAKE", confidence=0.90, processing_time_ms=10.0, status="READY")
    ]
    quality = make_quality(overall_score=0.90, label="GOOD")
    result = EvidenceService.calibrate_ensemble_evidence(preds, quality)

    assert result.overall_verdict == "LIKELY_MANIPULATED"
    assert result.overall_score >= 0.85
    assert result.disagreement_index < 0.15
    assert result.consensus_label == "HIGH_CONSENSUS"
    assert result.uncertainty_score < 0.35
    assert result.uncertainty_label == "LOW"


def test_evidence_service_high_disagreement():
    # 1 model predicts FAKE (0.95), another predicts REAL (0.95) -> manipulation prob = 0.05
    preds = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="FAKE", confidence=0.95, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="F3Net", model_version="1.0", prediction="REAL", confidence=0.95, processing_time_ms=10.0, status="READY")
    ]
    quality = make_quality(overall_score=0.85, label="GOOD")
    result = EvidenceService.calibrate_ensemble_evidence(preds, quality)

    # Disagreement should be severe
    assert result.disagreement_index >= 0.35
    assert result.consensus_label == "HIGH_DISAGREEMENT"
    # When disagreement is high, system should remain UNCERTAIN rather than guessing
    assert result.overall_verdict == "UNCERTAIN"
    assert result.uncertainty_score >= 0.50


def test_evidence_service_quality_attenuation():
    preds = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="FAKE", confidence=0.80, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="F3Net", model_version="1.0", prediction="FAKE", confidence=0.80, processing_time_ms=10.0, status="READY")
    ]
    # Under poor quality, uncertainty should be higher than under good quality
    good_quality = make_quality(overall_score=0.95, label="GOOD")
    poor_quality = make_quality(overall_score=0.30, label="POOR")

    good_result = EvidenceService.calibrate_ensemble_evidence(preds, good_quality)
    poor_result = EvidenceService.calibrate_ensemble_evidence(preds, poor_quality)

    assert poor_result.uncertainty_score > good_result.uncertainty_score


def test_api_evidence_engine_integration():
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color=(60, 80, 100))
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/v1/analyze/image",
        files={"file": ("evidence_test.png", buf, "image/png")},
        data={"mode": "standard"}
    )
    assert response.status_code == 201
    data = response.json()

    assert "overall_verdict" in data
    assert "uncertainty_score" in data
    assert "uncertainty_label" in data

    evidence_types = [e["evidence_type"] for e in data["evidence_items"]]
    assert "CONSENSUS_ANALYSIS" in evidence_types
    assert "UNCERTAINTY_BREAKDOWN" in evidence_types

    # Clean up
    client.delete(f"/api/v1/analysis/{data['uuid']}")
