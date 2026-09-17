"""Tests for analysis API endpoints and SQLite persistence."""

import io
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def create_sample_file(format_name: str = "PNG", size=(256, 256)):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color="blue")
    img.save(buf, format=format_name)
    buf.seek(0)
    return ("sample.png", buf, "image/png")


def test_analyze_image_workflow():
    # 1. Upload valid image
    filename, file_buf, mime = create_sample_file()
    response = client.post(
        "/api/v1/analyze/image",
        files={"file": (filename, file_buf, mime)},
        data={"mode": "standard"}
    )
    assert response.status_code == 201
    data = response.json()
    analysis_uuid = data["uuid"]
    assert data["filename"] == "sample.png"
    assert data["width"] == 256
    assert data["height"] == 256
    assert data["overall_verdict"] in ["LIKELY_AUTHENTIC", "UNCERTAIN", "LIKELY_MANIPULATED", "SUSPECTED_OOD"]
    assert len(data["model_predictions"]) == 6
    assert len(data["evidence_items"]) >= 1

    # 2. Retrieve by UUID
    get_res = client.get(f"/api/v1/analysis/{analysis_uuid}")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert retrieved["uuid"] == analysis_uuid
    assert retrieved["file_hash"] == data["file_hash"]

    # 3. List analyses
    list_res = client.get("/api/v1/analysis")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["uuid"] == analysis_uuid for i in items)

    # 4. Delete analysis
    del_res = client.delete(f"/api/v1/analysis/{analysis_uuid}")
    assert del_res.status_code == 200

    # 5. Confirm deleted
    check_deleted = client.get(f"/api/v1/analysis/{analysis_uuid}")
    assert check_deleted.status_code == 404
