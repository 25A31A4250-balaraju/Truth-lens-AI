"""Unit tests for SightengineService AI-generated image detection integration."""

import io
from pathlib import Path
from unittest.mock import patch, MagicMock
from PIL import Image
import httpx
import pytest

from backend.config import settings
from backend.services.sightengine_service import SightengineService, SightengineResult


@pytest.fixture
def dummy_image_file(tmp_path) -> Path:
    img_path = tmp_path / "test_sample.png"
    img = Image.new("RGB", (100, 100), color="blue")
    img.save(img_path, format="PNG")
    return img_path


def test_is_configured_empty_or_placeholders():
    with patch.object(settings, "SIGHTENGINE_API_USER", ""), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", ""):
        assert SightengineService.is_configured() is False

    with patch.object(settings, "SIGHTENGINE_API_USER", "your_api_user"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "your_api_secret"):
        assert SightengineService.is_configured() is False

    with patch.object(settings, "SIGHTENGINE_API_USER", "valid_user_123"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "valid_secret_xyz"):
        assert SightengineService.is_configured() is True


def test_detect_unconfigured(dummy_image_file):
    with patch.object(settings, "SIGHTENGINE_API_USER", ""), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", ""):
        result = SightengineService.detect_ai_generated(dummy_image_file)
        assert result.status == "unconfigured"
        assert result.is_configured is False
        assert "not configured" in result.error_message


def test_detect_file_not_found(tmp_path):
    missing_path = tmp_path / "non_existent_image.png"
    with patch.object(settings, "SIGHTENGINE_API_USER", "valid_user"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "valid_secret"):
        result = SightengineService.detect_ai_generated(missing_path)
        assert result.status == "file_not_found"
        assert "not found" in result.error_message


def test_detect_ai_generated_high_score(dummy_image_file):
    """Simulates response where Sightengine detects an AI-generated image (0.98 probability)."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "status": "success",
        "request": {"id": "req_12345", "timestamp": 1720000000.0, "operations": 1},
        "type": {"ai_generated": 0.985}
    }

    mock_client = MagicMock()
    mock_client.post.return_value = mock_resp

    with patch.object(settings, "SIGHTENGINE_API_USER", "valid_user"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "valid_secret"):
        result = SightengineService.detect_ai_generated(dummy_image_file, client=mock_client)

        assert result.status == "success"
        assert result.ai_generated_prob == 0.985
        assert result.verdict == "AI_GENERATED"
        assert result.verdict_label == "AI Generated"
        assert result.confidence == 0.985
        # Ensure credentials never appear in raw_response
        assert "api_secret" not in result.raw_response
        assert "valid_secret" not in str(result.to_dict())


def test_detect_real_photograph_low_score(dummy_image_file):
    """Simulates response where Sightengine detects an authentic real photo (0.04 probability)."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "status": "success",
        "request": {"id": "req_67890", "timestamp": 1720000000.0, "operations": 1},
        "type": {"ai_generated": 0.042}
    }

    mock_client = MagicMock()
    mock_client.post.return_value = mock_resp

    with patch.object(settings, "SIGHTENGINE_API_USER", "valid_user"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "valid_secret"):
        result = SightengineService.detect_ai_generated(dummy_image_file, client=mock_client)

        assert result.status == "success"
        assert result.ai_generated_prob == 0.042
        assert result.verdict == "LIKELY_REAL"
        assert result.verdict_label == "Likely Real"
        assert result.confidence == round(1.0 - 0.042, 4)


def test_detect_uncertain_borderline_score(dummy_image_file):
    """Simulates response where Sightengine score is borderline (0.52 probability)."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "status": "success",
        "request": {"id": "req_11111", "timestamp": 1720000000.0, "operations": 1},
        "type": {"ai_generated": 0.52}
    }

    mock_client = MagicMock()
    mock_client.post.return_value = mock_resp

    with patch.object(settings, "SIGHTENGINE_API_USER", "valid_user"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "valid_secret"):
        result = SightengineService.detect_ai_generated(dummy_image_file, client=mock_client)

        assert result.status == "success"
        assert result.ai_generated_prob == 0.52
        assert result.verdict == "UNCERTAIN"
        assert result.verdict_label == "Uncertain"


def test_detect_api_failure_response(dummy_image_file):
    """Simulates API failure response (e.g. rejected corrupt image)."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "status": "failure",
        "error": {
            "message": "Unsupported file format or corrupt image stream.",
            "code": 100
        }
    }

    mock_client = MagicMock()
    mock_client.post.return_value = mock_resp

    with patch.object(settings, "SIGHTENGINE_API_USER", "valid_user"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "valid_secret"):
        result = SightengineService.detect_ai_generated(dummy_image_file, client=mock_client)

        assert result.status == "failure"
        assert "Unsupported file format" in result.error_message


def test_detect_http_error_redaction(dummy_image_file):
    """Simulates HTTP 401 error and ensures secret is never exposed in error message."""
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.json.return_value = {
        "status": "failure",
        "error": {
            "message": "Invalid API user or secret credentials.",
            "code": 401
        }
    }

    mock_client = MagicMock()
    mock_client.post.return_value = mock_resp

    with patch.object(settings, "SIGHTENGINE_API_USER", "user_123"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "super_secret_key"):
        result = SightengineService.detect_ai_generated(dummy_image_file, client=mock_client)

        assert result.status == "api_error"
        assert "super_secret_key" not in result.error_message


def test_detect_timeout_exception(dummy_image_file):
    mock_client = MagicMock()
    mock_client.post.side_effect = httpx.TimeoutException("Connection timed out")

    with patch.object(settings, "SIGHTENGINE_API_USER", "valid_user"), \
         patch.object(settings, "SIGHTENGINE_API_SECRET", "valid_secret"):
        result = SightengineService.detect_ai_generated(dummy_image_file, client=mock_client)

        assert result.status == "timeout"
        assert "timed out" in result.error_message
