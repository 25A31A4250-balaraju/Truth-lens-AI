"""CPU-optimized Face Detection and Facial Crop Preprocessing Service.

Implements lightweight, offline-first facial localization:
- Extracts facial bounding boxes with 25% boundary margin to capture hairline
  and jaw blending artifacts.
- Normalizes crops for downstream detector tensors (224x224, 299x299).
- Gracefully handles non-face images without false classification.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import cv2
import numpy as np
from PIL import Image
from backend.config import settings
from backend.utils.logging_utils import logger


class DetectedFace:
    def __init__(
        self,
        x: int,
        y: int,
        width: int,
        height: int,
        confidence: float,
        crop_path: Optional[str] = None
    ):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.confidence = confidence
        self.crop_path = crop_path

    def to_dict(self) -> Dict[str, Any]:
        return {
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "confidence": round(self.confidence, 4),
            "crop_path": self.crop_path
        }


class FaceService:
    _cascade = None

    @classmethod
    def _get_cascade(cls):
        """Initializes OpenCV frontal face Haar cascade on first access."""
        if cls._cascade is None:
            try:
                if hasattr(cv2, "CascadeClassifier") and hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
                    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
                    cls._cascade = cv2.CascadeClassifier(cascade_path)
                    if cls._cascade.empty():
                        logger.warning(f"Failed to load Haar Cascade from {cascade_path}")
                        cls._cascade = None
            except Exception as e:
                logger.warning(f"CascadeClassifier initialization failed: {e}")
                cls._cascade = None
        return cls._cascade

    @classmethod
    def detect_faces(cls, image_path: Path, margin_percent: float = 0.25) -> Tuple[List[DetectedFace], bool]:
        """
        Detects faces in image file.
        Returns:
            (List[DetectedFace], face_detected_flag)
        """
        cascade = cls._get_cascade()
        if cascade is None or cascade.empty():
            logger.warning("Face detector cascade unavailable; skipping face detection.")
            return [], False

        try:
            # Read image using OpenCV
            img_bgr = cv2.imread(str(image_path))
            if img_bgr is None:
                logger.warning(f"Could not read image for face detection: {image_path}")
                return [], False

            h_img, w_img = img_bgr.shape[:2]
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            # Histogram equalization for illumination robustness
            gray_eq = cv2.equalizeHist(gray)

            # Detect multiscale with minSize 40x40
            faces = cascade.detectMultiScale(
                gray_eq,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(40, 40),
                flags=cv2.CASCADE_SCALE_IMAGE
            )

            detected: List[DetectedFace] = []

            for idx, (x, y, w, h) in enumerate(faces):
                # Calculate margin around face (25% to capture blending artifacts)
                margin_x = int(w * margin_percent)
                margin_y = int(h * margin_percent)

                # Clamp padded coordinates to image boundaries
                x1 = max(0, x - margin_x)
                y1 = max(0, y - margin_y)
                x2 = min(w_img, x + w + margin_x)
                y2 = min(h_img, y + h + margin_y)
                crop_w = x2 - x1
                crop_h = y2 - y1

                # Extract face crop
                crop_bgr = img_bgr[y1:y2, x1:x2]

                # Save standardized face crop to data/analyses
                crop_filename = f"{image_path.stem}_face_{idx}.jpg"
                crop_dest = settings.ANALYSES_DIR / crop_filename
                cv2.imwrite(str(crop_dest), crop_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])

                # Confidence heuristic: larger detected faces with balanced aspect ratio
                conf = min(0.98, max(0.65, 0.70 + (w * h) / (w_img * h_img)))

                face_obj = DetectedFace(
                    x=int(x1),
                    y=int(y1),
                    width=int(crop_w),
                    height=int(crop_h),
                    confidence=conf,
                    crop_path=str(crop_dest)
                )
                detected.append(face_obj)

            # Sort detected faces by area (primary face first)
            detected.sort(key=lambda f: f.width * f.height, reverse=True)

            has_face = len(detected) > 0
            return detected, has_face

        except Exception as e:
            logger.error(f"Error during face detection on {image_path}: {e}")
            return [], False
