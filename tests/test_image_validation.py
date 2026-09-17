"""Tests for image integrity verification and validation routines."""

import io
import pytest
from PIL import Image
from backend.utils.image_utils import (
    validate_and_inspect_image,
    calculate_sha256,
    ImageValidationError
)


def create_test_image_bytes(format_name: str = "JPEG", size=(256, 256), color="red") -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format_name)
    return buf.getvalue()


def test_valid_jpeg_validation():
    img_bytes = create_test_image_bytes(format_name="JPEG", size=(300, 300))
    meta = validate_and_inspect_image(img_bytes, "sample.jpg")
    assert meta["filename"] == "sample.jpg"
    assert meta["width"] == 300
    assert meta["height"] == 300
    assert meta["format"] == "JPEG"
    assert len(meta["file_hash"]) == 64


def test_valid_png_validation():
    img_bytes = create_test_image_bytes(format_name="PNG", size=(128, 128))
    meta = validate_and_inspect_image(img_bytes, "sample.png")
    assert meta["filename"] == "sample.png"
    assert meta["format"] == "PNG"
    assert meta["media_type"] == "image/png"


def test_corrupted_image_rejection():
    corrupted_bytes = b"NOT_AN_IMAGE_DATA_HEADER_CORRUPTED"
    with pytest.raises(ImageValidationError) as exc:
        validate_and_inspect_image(corrupted_bytes, "corrupt.jpg")
    assert "integrity check failed" in str(exc.value).lower() or "corrupted" in str(exc.value).lower()


def test_unsupported_extension_rejection():
    img_bytes = create_test_image_bytes(format_name="JPEG")
    with pytest.raises(ImageValidationError) as exc:
        validate_and_inspect_image(img_bytes, "payload.exe")
    assert "unsupported file extension" in str(exc.value).lower()


def test_sha256_reproducibility():
    img_bytes = create_test_image_bytes(format_name="JPEG")
    hash1 = calculate_sha256(img_bytes)
    hash2 = calculate_sha256(img_bytes)
    assert hash1 == hash2
    assert len(hash1) == 64
