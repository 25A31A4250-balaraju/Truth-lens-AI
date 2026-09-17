"""Performance profiling, memory leak verification, and boundary stress tests."""

import io
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app
from backend.utils.profiler import profiler

client = TestClient(app)


def create_test_image(width: int, height: int, color="blue") -> tuple:
    buf = io.BytesIO()
    img = Image.new("RGB", (width, height), color=color)
    img.save(buf, format="PNG")
    buf.seek(0)
    return (f"test_{width}x{height}.png", buf, "image/png")


def test_system_performance_profile_endpoint():
    """Verify GET /api/v1/health/profile returns valid process and hardware metrics."""
    res = client.get("/api/v1/health/profile")
    assert res.status_code == 200
    data = res.json()

    assert "process" in data
    assert "rss_mb" in data["process"]
    assert data["process"]["rss_mb"] > 0
    assert "host_hardware" in data
    assert "cpu_physical_cores" in data["host_hardware"]
    assert "storage" in data
    assert "database_size_kb" in data["storage"]


def test_garbage_collection_endpoint():
    """Verify POST /api/v1/health/gc triggers memory reclamation."""
    res = client.post("/api/v1/health/gc")
    assert res.status_code == 200
    data = res.json()
    assert "objects_collected" in data
    assert "current_rss_mb" in data


def test_memory_stability_repeated_inferences():
    """Verify that repeated analyses do not cause memory accumulation above 450 MB."""
    profiler.trigger_memory_cleanup()
    
    # Run 5 consecutive analyses
    for i in range(5):
        filename, buf, mime = create_test_image(200, 200, color="gray")
        res = client.post(
            "/api/v1/analyze/image",
            files={"file": (filename, buf, mime)},
            data={"mode": "quick"}
        )
        assert res.status_code == 201

    profiler.trigger_memory_cleanup()
    mem_info = profiler.get_process_memory_info()
    # Ensure memory footprint conforms to low-resource constraint (< 450 MB)
    assert mem_info["rss_mb"] < 450.0, f"Memory leaked to {mem_info['rss_mb']} MB (limit: 450 MB)"


def test_extreme_aspect_ratio_panoramic():
    """Verify extreme wide aspect ratio (1600x200) executes without resizing or patch errors."""
    filename, buf, mime = create_test_image(1600, 200, color="green")
    res = client.post(
        "/api/v1/analyze/image",
        files={"file": (filename, buf, mime)},
        data={"mode": "quick"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["width"] == 1600
    assert data["height"] == 200
    assert len(data["regions"]) == 16


def test_extreme_aspect_ratio_vertical_strip():
    """Verify extreme vertical strip (200x1600) executes safely."""
    filename, buf, mime = create_test_image(200, 1600, color="red")
    res = client.post(
        "/api/v1/analyze/image",
        files={"file": (filename, buf, mime)},
        data={"mode": "quick"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["width"] == 200
    assert data["height"] == 1600


def test_small_thumbnail_dimension():
    """Verify small image (32x32) handles patch tessellation safely."""
    filename, buf, mime = create_test_image(32, 32, color="yellow")
    res = client.post(
        "/api/v1/analyze/image",
        files={"file": (filename, buf, mime)},
        data={"mode": "quick"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["width"] == 32
    assert data["height"] == 32
    assert len(data["regions"]) == 16


def test_truncated_corrupted_payload_rejection():
    """Verify truncated image bytes fail gracefully with 400/422, not unhandled 500."""
    truncated_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"  # partial PNG header
    res = client.post(
        "/api/v1/analyze/image",
        files={"file": ("corrupt.png", io.BytesIO(truncated_bytes), "image/png")},
        data={"mode": "quick"}
    )
    assert res.status_code in (400, 422)
