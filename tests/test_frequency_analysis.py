"""Tests for Forensic Frequency Signals Engine and Image Quality Assessment."""

import io
import os
from pathlib import Path
from PIL import Image
import numpy as np
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.frequency_service import FrequencyService
from backend.services.quality_service import QualityService

client = TestClient(app)


def test_quality_service_metrics(tmp_path: Path):
    # Create test image with known gradient texture
    img_path = tmp_path / "test_quality.png"
    arr = np.random.randint(50, 200, (128, 128, 3), dtype=np.uint8)
    Image.fromarray(arr).save(img_path)

    metrics = QualityService.evaluate_quality(img_path)
    assert metrics.sharpness_score >= 0.0
    assert metrics.noise_level >= 0.0
    assert 0.0 <= metrics.contrast_score <= 255.0
    assert metrics.overall_label in ["GOOD", "MODERATE", "POOR"]


def test_frequency_service_math(tmp_path: Path):
    # Create synthetic test image
    img_path = tmp_path / "test_freq.png"
    arr = np.zeros((128, 128, 3), dtype=np.uint8)
    # Add high-frequency checkerboard pattern
    arr[::2, ::2] = 255
    arr[1::2, 1::2] = 255
    Image.fromarray(arr).save(img_path)

    metrics = FrequencyService.analyze_frequency(img_path, "test_uuid_123")

    # Assert percentages sum to ~100%
    total_pct = metrics.low_freq_energy_pct + metrics.mid_freq_energy_pct + metrics.high_freq_energy_pct
    assert abs(total_pct - 100.0) < 0.5

    # Assert metrics are positive and bounded
    assert metrics.high_low_ratio >= 0.0
    assert metrics.spectral_entropy > 0.0
    assert metrics.fft_image_path != ""
    assert Path(metrics.fft_image_path).exists()

    # Clean up generated test fft artifact
    if Path(metrics.fft_image_path).exists():
        os.remove(metrics.fft_image_path)


def test_api_frequency_evidence_generation():
    # Send image to /api/v1/analyze/image
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color=(120, 150, 180))
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/v1/analyze/image",
        files={"file": ("freq_sample.png", buf, "image/png")},
        data={"mode": "standard"}
    )
    assert response.status_code == 201
    data = response.json()

    # Verify fft_path is present and points to a real file
    assert data["fft_path"] is not None
    fft_file = Path(data["fft_path"])
    assert fft_file.exists()

    # Verify evidence items include frequency and quality indicators
    evidence_types = [e["evidence_type"] for e in data["evidence_items"]]
    assert "IMAGE_QUALITY" in evidence_types
    assert "FREQUENCY_SPECTRUM" in evidence_types
    assert "SPECTRAL_ENTROPY" in evidence_types

    # Clean up
    if fft_file.exists():
        os.remove(fft_file)
    client.delete(f"/api/v1/analysis/{data['uuid']}")
