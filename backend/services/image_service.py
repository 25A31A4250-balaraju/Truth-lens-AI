"""Service layer for image ingestion, quality heuristics, and metadata extraction."""

from pathlib import Path
from typing import Dict, Any, Optional
from PIL import Image, ImageStat
from sqlalchemy.orm import Session
from backend.database.models import Analysis
from backend.database.repositories import AnalysisRepository
from backend.utils.image_utils import validate_and_inspect_image, save_uploaded_image
from backend.utils.logging_utils import logger


class ImageService:
    @staticmethod
    def estimate_basic_quality(image_path: Path) -> Dict[str, Any]:
        """
        Lightweight quality estimation:
        Checks resolution, brightness, and standard deviation (contrast indicator).
        """
        try:
            with Image.open(image_path) as img:
                img_gray = img.convert("L")
                stat = ImageStat.Stat(img_gray)
                mean_brightness = stat.mean[0]  # 0 to 255
                std_contrast = stat.stddev[0]   # low stddev = flat/washed out

                w, h = img.size
                is_high_res = (w >= 512 and h >= 512)
                is_moderate_res = (w >= 224 and h >= 224)

                # Heuristic quality scoring
                if is_high_res and 30 < mean_brightness < 225 and std_contrast > 25:
                    return {"score": 0.88, "label": "GOOD"}
                elif is_moderate_res and 15 < mean_brightness < 240 and std_contrast > 15:
                    return {"score": 0.65, "label": "MODERATE"}
                else:
                    return {"score": 0.38, "label": "POOR"}
        except Exception as e:
            logger.warning(f"Quality heuristic error on {image_path}: {e}")
            return {"score": 0.50, "label": "MODERATE"}

    @classmethod
    def ingest_image(
        cls,
        file_bytes: bytes,
        original_filename: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Validates, saves, extracts quality metrics, and returns ingestion data.
        """
        # Validate format, integrity, size
        meta = validate_and_inspect_image(file_bytes, original_filename)

        # Securely persist to disk
        analysis_uuid, stored_path = save_uploaded_image(file_bytes, original_filename)

        # Lightweight image quality heuristic
        quality_meta = cls.estimate_basic_quality(stored_path)

        # Check if identical hash already exists in DB for reference
        existing = AnalysisRepository.get_by_hash(db, meta["file_hash"])
        is_duplicate = existing is not None

        return {
            "uuid": analysis_uuid,
            "stored_path": str(stored_path),
            "metadata": meta,
            "quality": quality_meta,
            "is_duplicate": is_duplicate,
            "existing_analysis_uuid": existing.uuid if existing else None
        }
