"""Tests for Pretrained Forensic Model Adapters and CPU Execution Lifecycle."""

import io
from pathlib import Path
from PIL import Image
import pytest
from backend.models.model_registry import model_registry
from backend.models.xception_adapter import XceptionAdapter
from backend.models.effort_adapter import EffortAdapter


@pytest.fixture
def sample_image_file(tmp_path) -> Path:
    img_path = tmp_path / "adapter_test_image.jpg"
    img = Image.new("RGB", (300, 300), color=(100, 150, 200))
    img.save(img_path, format="JPEG")
    return img_path


def test_model_registry_contains_all_adapters():
    models = model_registry.list_models()
    assert len(models) == 6
    names = {m["name"] for m in models}
    assert names == {"Xception", "Effort", "LSDA", "F3Net", "SBI", "DINOv2"}


def test_adapter_standby_on_missing_checkpoint(sample_image_file):
    adapter = XceptionAdapter()
    adapter.expected_checkpoint = "non_existent_mock_checkpoint.pth"
    assert adapter.is_checkpoint_available is False
    assert adapter.status == "STANDBY_NO_CHECKPOINT"

    # Prediction should gracefully report standby without throwing
    res = adapter.predict(sample_image_file)
    assert res["model_name"] == "Xception"
    assert res["status"] == "STANDBY_NO_CHECKPOINT"
    assert res["prediction"] == "UNCERTAIN"
    assert res["confidence"] == 0.50
    assert "pending" in res["error_message"].lower() or "checkpoints" in res["error_message"].lower()


def test_effort_adapter_metadata():
    adapter = EffortAdapter()
    assert adapter.category == "SPATIAL"
    assert adapter.input_size == (224, 224)
    assert adapter.expected_checkpoint == "effort_pretrained.pth"


def test_inference_pipeline_sequential_execution(sample_image_file):
    results = model_registry.run_inference_pipeline(sample_image_file, sequential_unload=True)
    assert len(results) == 6
    for res in results:
        assert "model_name" in res
        assert "prediction" in res
        assert "confidence" in res
        assert "status" in res
        assert "processing_time_ms" in res
        assert res["status"] in ["READY", "STANDBY_NO_CHECKPOINT", "DISABLED", "COMPLETED"]
