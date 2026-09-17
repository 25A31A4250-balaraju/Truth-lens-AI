"""Tests for Forensic Reporting Engine (Markdown and JSON certificates)."""

import io
from datetime import datetime, timezone
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.report_service import ReportService
from backend.database.models import Analysis, ModelPrediction, EvidenceItem, RobustnessTest

client = TestClient(app)


def make_mock_analysis() -> Analysis:
    a = Analysis(
        id=101,
        uuid="report-test-uuid-999",
        filename="suspect_face.png",
        stored_path="data/uploads/suspect_face.png",
        file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        media_type="image/png",
        file_size_bytes=524288,
        width=512,
        height=512,
        overall_verdict="LIKELY_MANIPULATED",
        overall_score=0.88,
        uncertainty_score=0.22,
        uncertainty_label="LOW",
        image_quality_score=0.91,
        image_quality_label="GOOD",
        face_count=1,
        processing_time_ms=142.5,
        analysis_mode="standard",
        created_at=datetime.now(timezone.utc)
    )
    a.model_predictions = [
        ModelPrediction(model_name="Effort", model_version="1.0", prediction="FAKE", confidence=0.92, processing_time_ms=18.0, status="READY"),
        ModelPrediction(model_name="F3Net", model_version="1.0", prediction="FAKE", confidence=0.85, processing_time_ms=22.0, status="READY"),
    ]
    a.evidence_items = [
        EvidenceItem(evidence_type="SPATIAL_PATCHES", score=88.5, description="High gradient variance", source_model="PatchService"),
        EvidenceItem(evidence_type="FREQUENCY_SPECTRUM", score=0.12, description="Anomalous high-frequency ratio", source_model="FrequencyService")
    ]
    a.robustness_tests = [
        RobustnessTest(transformation="JPEG_COMPRESSION", parameter="quality=70", prediction="FAKE", score_delta=-0.04, uncertainty_delta=0.06)
    ]
    return a


def test_markdown_report_formatting():
    mock_a = make_mock_analysis()
    report = ReportService.generate_markdown_report(mock_a)

    assert "# DEEPTRACE-X Forensic Analysis Dossier" in report
    assert mock_a.uuid.upper() in report
    assert mock_a.file_hash in report
    assert mock_a.overall_verdict in report
    assert "88.0%" in report  # score
    assert "Effort" in report
    assert "F3Net" in report
    assert "JPEG COMPRESSION" in report
    assert "Probabilistic Forensic Evaluation Disclaimer" in report


def test_json_certificate_generation():
    mock_a = make_mock_analysis()
    cert = ReportService.generate_json_certificate(mock_a)

    assert cert["schema_version"] == "1.0"
    assert cert["system"] == "DEEPTRACE-X"
    assert cert["dossier_uuid"] == mock_a.uuid
    assert cert["custody"]["file_hash_sha256"] == mock_a.file_hash
    assert cert["assessment"]["overall_verdict"] == "LIKELY_MANIPULATED"
    assert len(cert["model_predictions"]) == 2
    assert len(cert["evidence_items"]) == 2
    assert len(cert["robustness_tests"]) == 1
    assert "disclaimer" in cert


def test_api_report_endpoints():
    buf = io.BytesIO()
    img = Image.new("RGB", (256, 256), color=(200, 180, 160))
    img.save(buf, format="PNG")
    buf.seek(0)

    # Ingest image
    res = client.post(
        "/api/v1/analyze/image",
        files={"file": ("report_sample.png", buf, "image/png")},
        data={"mode": "standard"}
    )
    assert res.status_code == 201
    data = res.json()
    uuid = data["uuid"]

    # 1. Download Markdown report
    md_res = client.get(f"/api/v1/analysis/{uuid}/report/markdown")
    assert md_res.status_code == 200
    assert "text/markdown" in md_res.headers.get("content-type", "")
    assert data["file_hash"] in md_res.text
    assert "DEEPTRACE-X Forensic Analysis Dossier" in md_res.text

    # 2. Download JSON certificate
    json_res = client.get(f"/api/v1/analysis/{uuid}/report/json")
    assert json_res.status_code == 200
    cert_data = json_res.json()
    assert cert_data["schema_version"] == "1.0"
    assert cert_data["dossier_uuid"] == uuid
    assert cert_data["custody"]["file_hash_sha256"] == data["file_hash"]

    # Clean up
    client.delete(f"/api/v1/analysis/{uuid}")
