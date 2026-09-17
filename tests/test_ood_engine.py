"""Tests for Out-Of-Distribution (OOD) & Uncertainty Engine."""

import io
import os
from pathlib import Path
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app
from backend.database.models import ModelPrediction
from backend.services.ood_service import OODService, OODAssessment
from backend.services.evidence_service import EvidenceService
from backend.services.quality_service import ImageQualityAssessment

client = TestClient(app)


def test_ood_embedding_extraction(tmp_path: Path):
    img_path = tmp_path / "sample_img.png"
    arr = np.random.randint(0, 255, (128, 128, 3), dtype=np.uint8)
    Image.fromarray(arr).save(img_path)

    emb = OODService.extract_semantic_embedding(img_path)
    assert emb.shape == (384,)
    norm = np.linalg.norm(emb)
    assert abs(norm - 1.0) < 1e-3


def test_ood_service_evaluation(tmp_path: Path):
    img_path = tmp_path / "ood_test.png"
    arr = np.random.randint(40, 220, (128, 128, 3), dtype=np.uint8)
    Image.fromarray(arr).save(img_path)

    assessment = OODService.evaluate_distribution_shift(img_path, "ood_test_uuid")
    assert 0.0 <= assessment.ood_score <= 1.0
    assert assessment.cosine_distance >= 0.0
    assert assessment.embedding_dim == 384
    assert Path(assessment.embedding_path).exists()

    loaded_vec = np.load(assessment.embedding_path)
    assert loaded_vec.shape == (384,)

    # Clean up
    if Path(assessment.embedding_path).exists():
        os.remove(assessment.embedding_path)


def test_evidence_engine_suspected_ood_trigger():
    preds = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="FAKE", confidence=0.85, processing_time_ms=10.0, status="READY"),
        ModelPrediction(model_name="F3Net", model_version="1.0", prediction="FAKE", confidence=0.88, processing_time_ms=10.0, status="READY")
    ]
    quality = ImageQualityAssessment(
        overall_score=0.90, overall_label="GOOD", sharpness_score=150.0,
        noise_level=2.0, contrast_score=50.0, brightness_score=120.0,
        clipping_pct=0.5, explanation="Optimal quality"
    )
    ood_mock = OODAssessment(
        ood_score=0.82,
        cosine_distance=0.68,
        euclidean_distance=1.16,
        distribution_label="SUSPECTED_OOD",
        is_ood=True,
        embedding_path="",
        embedding_dim=384,
        explanation="Severe feature distribution shift indicating novel generator."
    )

    result = EvidenceService.calibrate_ensemble_evidence(
        preds, quality, ood_assessment=ood_mock
    )

    assert result.overall_verdict == "SUSPECTED_OOD"
    assert result.uncertainty_score >= 0.70
    assert result.uncertainty_label == "HIGH"
    types = [e.evidence_type for e in result.evidence_items]
    assert "OOD_DISTRIBUTION_ANALYSIS" in types


def test_api_ood_evidence_and_embedding_persistence():
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color=(180, 120, 90))
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/v1/analyze/image",
        files={"file": ("ood_api_sample.png", buf, "image/png")},
        data={"mode": "standard"}
    )
    assert response.status_code == 201
    data = response.json()

    evidence_types = [e["evidence_type"] for e in data["evidence_items"]]
    assert "OOD_DISTRIBUTION_ANALYSIS" in evidence_types

    # Clean up
    client.delete(f"/api/v1/analysis/{data['uuid']}")
