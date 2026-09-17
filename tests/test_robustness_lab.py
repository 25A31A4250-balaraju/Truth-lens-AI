"""Tests for Robustness & Perturbation Testing Lab."""

import io
import os
from pathlib import Path
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.robustness_service import PerturbationTransform, RobustnessService
from backend.database.models import Analysis

client = TestClient(app)


def test_perturbation_transforms():
    arr = np.random.randint(50, 200, (100, 100, 3), dtype=np.uint8)

    # 1. JPEG Compression
    jpeg_img = PerturbationTransform.apply_jpeg(arr, quality=70)
    assert jpeg_img.shape == (100, 100, 3)
    assert jpeg_img.dtype == np.uint8

    # 2. Gaussian Noise
    noise_img = PerturbationTransform.apply_noise(arr, sigma=15.0)
    assert noise_img.shape == (100, 100, 3)
    assert np.all(noise_img >= 0) and np.all(noise_img <= 255)

    # 3. Gaussian Blur
    blur_img = PerturbationTransform.apply_blur(arr, sigma=1.5)
    assert blur_img.shape == (100, 100, 3)

    # 4. Rescaling
    rescale_img = PerturbationTransform.apply_rescale(arr, scale=0.5)
    assert rescale_img.shape == (100, 100, 3)


def test_robustness_service_suite_execution(tmp_path: Path):
    img_path = tmp_path / "test_robust.png"
    arr = np.random.randint(40, 220, (128, 128, 3), dtype=np.uint8)
    Image.fromarray(arr).save(img_path)

    mock_analysis = Analysis(
        id=999,
        uuid="test_uuid_robust",
        filename="test_robust.png",
        stored_path=str(img_path),
        file_hash="mock_hash",
        media_type="image/png",
        file_size_bytes=1024,
        width=128,
        height=128,
        overall_verdict="LIKELY_AUTHENTIC",
        overall_score=0.25,
        uncertainty_score=0.30,
        uncertainty_label="LOW",
        face_count=0,
        processing_time_ms=50.0,
        analysis_mode="standard"
    )

    stability_index, stability_label, tests = RobustnessService.run_robustness_suite(
        mock_analysis, tmp_path
    )

    assert 0.0 <= stability_index <= 1.0
    assert stability_label in ["HIGHLY_STABLE", "MODERATELY_STABLE", "UNSTABLE"]
    assert len(tests) == 6
    for t in tests:
        assert t.transformation in ["JPEG_COMPRESSION", "GAUSSIAN_NOISE", "GAUSSIAN_BLUR", "RESIZING"]
        assert -1.0 <= t.score_delta <= 1.0
        assert -1.0 <= t.uncertainty_delta <= 1.0


def test_api_robustness_endpoints():
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color=(140, 110, 80))
    img.save(buf, format="PNG")
    buf.seek(0)

    # Ingest image
    res = client.post(
        "/api/v1/analyze/image",
        files={"file": ("robust_sample.png", buf, "image/png")},
        data={"mode": "standard"}
    )
    assert res.status_code == 201
    analysis_data = res.json()
    uuid = analysis_data["uuid"]

    # 1. Trigger Robustness Lab
    rob_post = client.post(f"/api/v1/analysis/{uuid}/robustness")
    assert rob_post.status_code == 200
    post_data = rob_post.json()
    assert post_data["analysis_uuid"] == uuid
    assert 0.0 <= post_data["stability_index"] <= 1.0
    assert post_data["stability_label"] in ["HIGHLY_STABLE", "MODERATELY_STABLE", "UNSTABLE"]
    assert len(post_data["tests"]) == 6

    # 2. Retrieve Robustness Results
    rob_get = client.get(f"/api/v1/analysis/{uuid}/robustness")
    assert rob_get.status_code == 200
    get_data = rob_get.json()
    assert get_data["analysis_uuid"] == uuid
    assert len(get_data["tests"]) == 6

    # Clean up
    client.delete(f"/api/v1/analysis/{uuid}")
