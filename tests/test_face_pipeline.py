"""Tests for CPU Face Detection and Patch Decomposition Pipeline."""

import io
from pathlib import Path
from PIL import Image, ImageDraw
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.face_service import FaceService
from backend.services.patch_service import PatchService

client = TestClient(app)


def create_mock_face_image(path: Path) -> Path:
    """Creates a basic image to verify pipeline execution."""
    img = Image.new("RGB", (320, 320), color=(240, 220, 200))
    draw = ImageDraw.Draw(img)
    # Draw simple facial feature approximations
    draw.ellipse([80, 60, 240, 260], fill=(225, 195, 170))  # Head
    draw.ellipse([110, 110, 140, 130], fill=(50, 50, 50))    # Left eye
    draw.ellipse([180, 110, 210, 130], fill=(50, 50, 50))    # Right eye
    draw.line([160, 130, 160, 170], fill=(180, 140, 120), width=3)  # Nose
    draw.arc([130, 170, 190, 210], start=0, end=180, fill=(150, 50, 50), width=4) # Mouth
    img.save(path, format="JPEG")
    return path


def create_non_face_image(path: Path) -> Path:
    """Creates a uniform noise/texture image without faces."""
    img = Image.new("RGB", (300, 300), color=(80, 120, 160))
    img.save(path, format="JPEG")
    return path


def test_non_face_fallback(tmp_path):
    img_path = create_non_face_image(tmp_path / "landscape.jpg")
    faces, has_face = FaceService.detect_faces(img_path)
    assert has_face is False
    assert len(faces) == 0


def test_patch_generation_dimensions(tmp_path):
    img_path = create_non_face_image(tmp_path / "texture.jpg")
    patches = PatchService.generate_grid_patches(img_path, bounding_box=None, rows=4, cols=4)
    assert len(patches) == 16
    for p in patches:
        assert p.x >= 0 and p.y >= 0
        assert p.width > 0 and p.height > 0
        assert 0.0 <= p.score <= 1.0
        assert 1 <= p.rank <= 16


def test_patch_generation_with_bounding_box(tmp_path):
    img_path = create_non_face_image(tmp_path / "texture.jpg")
    bbox = {"x": 50, "y": 50, "width": 200, "height": 200}
    patches = PatchService.generate_grid_patches(img_path, bounding_box=bbox, rows=4, cols=4)
    assert len(patches) == 16
    for p in patches:
        assert p.x >= 50
        assert p.y >= 50
        assert p.x + p.width <= 250
        assert p.y + p.height <= 250


def test_analysis_api_persists_regions_and_face_evidence():
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color="green")
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/v1/analyze/image",
        files={"file": ("face_pipeline_test.jpg", buf, "image/jpeg")},
        data={"mode": "standard"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "face_count" in data
    assert "regions" in data
    assert len(data["regions"]) == 16  # 16 patches generated
    evidence_types = {e["evidence_type"] for e in data["evidence_items"]}
    assert "FACE_LOCALIZATION" in evidence_types
    assert "SPATIAL_PATCHES" in evidence_types
