"""Tests for Expo Presentation Mode API and Benchmark Showcase."""

import os
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.expo_service import ExpoService

client = TestClient(app)


def test_expo_benchmark_cases_metadata():
    """Verify that GET /api/v1/expo/cases returns all 4 pre-curated challenge cases."""
    response = client.get("/api/v1/expo/cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) == 4
    
    case_ids = [c["case_id"] for c in cases]
    assert "case_a_authentic" in case_ids
    assert "case_b_blended" in case_ids
    assert "case_c_frequency" in case_ids
    assert "case_d_ood_diffusion" in case_ids

    for c in cases:
        assert "title" in c
        assert "category" in c
        assert "description" in c
        assert "expected_verdict" in c
        assert "key_forensic_finding" in c
        assert "filename" in c


def test_expo_assets_generation():
    """Verify that ExpoService correctly generates and saves sample benchmark images in data/expo."""
    ExpoService.ensure_seeded_benchmark_images()
    cases = ExpoService.CASES
    assert len(cases) == 4
    for c in cases:
        filepath = ExpoService.get_case_file_path(c.case_id)
        assert filepath is not None
        assert filepath.exists(), f"Asset {c.filename} does not exist at {filepath}"
        assert os.path.getsize(filepath) > 0, f"Asset {c.filename} is empty"


def test_load_expo_case_authentic():
    """Verify executing case_a_authentic loads complete analysis with robustness tests."""
    response = client.post("/api/v1/expo/load/case_a_authentic")
    assert response.status_code == 201
    data = response.json()

    assert "uuid" in data
    assert data["filename"] == "case_a_authentic.png"
    assert data["file_hash"] is not None
    assert len(data["model_predictions"]) == 6
    assert len(data["evidence_items"]) >= 1
    # Check robustness suite auto-execution
    assert "robustness_tests" in data
    assert len(data["robustness_tests"]) >= 4


def test_load_expo_case_ood_diffusion():
    """Verify executing case_d_ood_diffusion successfully runs analysis."""
    response = client.post("/api/v1/expo/load/case_d_ood_diffusion")
    assert response.status_code == 201
    data = response.json()

    assert data["filename"] == "case_d_ood_diffusion.png"
    assert "overall_verdict" in data
    assert "overall_score" in data
    assert len(data["robustness_tests"]) >= 4


def test_load_invalid_expo_case():
    """Verify 404 response for unknown case IDs."""
    response = client.post("/api/v1/expo/load/nonexistent_case")
    assert response.status_code == 404
