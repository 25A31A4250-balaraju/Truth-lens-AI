"""Tests for model registry stability and graceful standby status."""

from backend.models.model_registry import model_registry


def test_registered_models_count():
    models = model_registry.list_models()
    assert len(models) == 6
    names = {m["name"] for m in models}
    expected = {"Effort", "LSDA", "F3Net", "SBI", "Xception", "DINOv2"}
    assert names == expected


def test_models_have_cpu_device():
    for model in model_registry.list_models():
        assert model["device"] == "cpu"
        assert model["status"] in ["READY", "STANDBY_NO_CHECKPOINT", "DISABLED"]


def test_effort_model_metadata():
    effort = model_registry.get_model("Effort")
    assert effort is not None
    assert effort.category == "SPATIAL"
    assert effort.expected_checkpoint == "effort_pretrained.pth"
