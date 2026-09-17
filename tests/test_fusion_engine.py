"""Tests for Interpretable Fusion Engine."""

import io
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app
from backend.database.models import ModelPrediction
from backend.services.fusion_service import FusionService
from backend.services.quality_service import ImageQualityAssessment
from backend.services.frequency_service import FrequencyMetrics
from backend.services.ood_service import OODAssessment

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
        explanation="Test quality"
    )


def test_fusion_service_all_standby():
    preds = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="N/A", confidence=0.0, processing_time_ms=0.0, status="STANDBY_NO_CHECKPOINT"),
        ModelPrediction(model_name="F3Net", model_version="1.0", prediction="N/A", confidence=0.0, processing_time_ms=0.0, status="STANDBY_NO_CHECKPOINT"),
        ModelPrediction(model_name="SBI", model_version="1.0", prediction="N/A", confidence=0.0, processing_time_ms=0.0, status="STANDBY_NO_CHECKPOINT"),
        ModelPrediction(model_name="LSDA", model_version="1.0", prediction="N/A", confidence=0.0, processing_time_ms=0.0, status="STANDBY_NO_CHECKPOINT"),
    ]
    quality = make_quality()
    result = FusionService.fuse_forensic_modalities(preds, quality)

    assert result.fused_score >= 0.0
    assert "spatial" in result.modalities
    assert "frequency" in result.modalities
    assert "boundary" in result.modalities
    assert "semantic" in result.modalities

    total_pct = sum(m.contribution_pct for m in result.modalities.values())
    assert abs(total_pct - 100.0) < 0.5
    assert result.evidence_item.evidence_type == "FUSION_DECOMPOSITION"


def test_fusion_service_active_detectors():
    preds = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="FAKE", confidence=0.90, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="F3Net", model_version="1.0", prediction="FAKE", confidence=0.85, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="SBI", model_version="1.0", prediction="REAL", confidence=0.80, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="LSDA", model_version="1.0", prediction="FAKE", confidence=0.75, processing_time_ms=10.0, status="READY"),
    ]
    quality = make_quality(overall_score=0.90, label="GOOD")
    freq = FrequencyMetrics(
        low_freq_energy_pct=80.0,
        mid_freq_energy_pct=15.0,
        high_freq_energy_pct=5.0,
        high_low_ratio=0.062,
        spectral_entropy=12.5,
        fft_image_path=""
    )
    ood = OODAssessment(
        ood_score=0.20,
        cosine_distance=0.25,
        euclidean_distance=0.70,
        distribution_label="IN_DISTRIBUTION",
        is_ood=False,
        embedding_path="",
        embedding_dim=384,
        explanation="In-distribution"
    )

    result = FusionService.fuse_forensic_modalities(
        preds, quality, frequency_metrics=freq, ood_assessment=ood, top_patch_score=45.0
    )

    assert 0.0 <= result.fused_score <= 1.0
    total_pct = sum(m.contribution_pct for m in result.modalities.values())
    assert abs(total_pct - 100.0) < 0.5
    assert result.modalities["spatial"].raw_score > 0.50


def test_fusion_quality_attenuation():
    preds = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="FAKE", confidence=0.85, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="SBI", model_version="1.0", prediction="FAKE", confidence=0.85, processing_time_ms=10.0, status="READY")
    ]
    good_q = make_quality(overall_score=0.95, label="GOOD")
    poor_q = make_quality(overall_score=0.30, label="POOR")

    res_good = FusionService.fuse_forensic_modalities(preds, good_q)
    res_poor = FusionService.fuse_forensic_modalities(preds, poor_q)

    # In poor quality, spatial and boundary weights should be attenuated
    assert res_poor.modalities["spatial"].weight < res_good.modalities["spatial"].weight
    assert res_poor.modalities["boundary"].weight < res_good.modalities["boundary"].weight
    # While frequency and semantic weights are reinforced
    assert res_poor.modalities["frequency"].weight > res_good.modalities["frequency"].weight


def test_api_fusion_evidence_generation():
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color=(70, 90, 110))
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/v1/analyze/image",
        files={"file": ("fusion_test.png", buf, "image/png")},
        data={"mode": "standard"}
    )
    assert response.status_code == 201
    data = response.json()

    evidence_types = [e["evidence_type"] for e in data["evidence_items"]]
    assert "FUSION_DECOMPOSITION" in evidence_types

    # Clean up
    client.delete(f"/api/v1/analysis/{data['uuid']}")
