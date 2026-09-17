"""Image verification, cryptographic hashing, and validation utilities."""

import hashlib
import io
import os
import uuid
from pathlib import Path
from typing import Tuple, Dict, Any
from PIL import Image, ImageOps
from backend.config import settings


class ImageValidationError(Exception):
    """Raised when an uploaded image fails validation or corruption checks."""
    pass


def calculate_sha256(file_bytes: bytes) -> str:
    """Computes SHA-256 cryptographic hash of image bytes."""
    hasher = hashlib.sha256()
    hasher.update(file_bytes)
    return hasher.hexdigest()


def validate_and_inspect_image(file_bytes: bytes, original_filename: str) -> Dict[str, Any]:
    """
    Validates uploaded image bytes against format, size, and corruption constraints.
    Returns metadata dict.
    """
    # 1. Size constraint check
    size_bytes = len(file_bytes)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise ImageValidationError(
            f"File size ({size_bytes / (1024*1024):.2f} MB) exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE_MB} MB)."
        )
    if size_bytes == 0:
        raise ImageValidationError("Uploaded file is empty.")

    # 2. Extension check
    ext = Path(original_filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise ImageValidationError(
            f"Unsupported file extension '{ext}'. Supported formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # 3. Pillow open & verify integrity
    try:
        stream = io.BytesIO(file_bytes)
        with Image.open(stream) as img:
            # Verify file integrity
            img.verify()

        # Reopen for metadata inspection since verify() clears image state
        stream.seek(0)
        with Image.open(stream) as img:
            format_name = img.format
            width, height = img.size
            mode = img.mode

            if format_name.upper() not in ["JPEG", "PNG", "WEBP"]:
                raise ImageValidationError(f"Invalid image format detected: {format_name}")

            if width < 32 or height < 32:
                raise ImageValidationError(
                    f"Image dimensions ({width}x{height}) are too small for forensic evaluation (min 32x32)."
                )

            mime_type = f"image/{format_name.lower()}"
            aspect_ratio = round(width / height, 4) if height > 0 else 1.0

    except ImageValidationError:
        raise
    except Exception as e:
        raise ImageValidationError(f"Image integrity check failed or file is corrupted: {str(e)}")

    file_hash = calculate_sha256(file_bytes)

    return {
        "filename": original_filename,
        "file_hash": file_hash,
        "media_type": mime_type,
        "file_size_bytes": size_bytes,
        "width": width,
        "height": height,
        "mode": mode,
        "format": format_name,
        "aspect_ratio": aspect_ratio
    }


def save_uploaded_image(file_bytes: bytes, original_filename: str) -> Tuple[str, Path]:
    """
    Saves image bytes securely to disk using UUID filename to prevent path traversal.
    Returns (analysis_uuid, stored_path).
    """
    settings.ensure_directories()
    analysis_uuid = str(uuid.uuid4())
    ext = Path(original_filename).suffix.lower()
    if not ext:
        ext = ".jpg"
    safe_filename = f"{analysis_uuid}{ext}"
    stored_path = settings.UPLOAD_DIR / safe_filename

    with open(stored_path, "wb") as f:
        f.write(file_bytes)

    return analysis_uuid, stored_path
