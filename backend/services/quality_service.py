"""Image Quality and Degradation Analysis Service for DEEPTRACE-X.

Evaluates objective image metrics (sharpness, noise, clipping, resolution)
to determine whether input degradation impairs neural forensic reliability.
"""

from pathlib import Path
from typing import Dict, Any
import cv2
import numpy as np
from backend.utils.logging_utils import logger


class ImageQualityAssessment:
    def __init__(
        self,
        overall_score: float,
        overall_label: str,
        sharpness_score: float,
        noise_level: float,
        contrast_score: float,
        brightness_score: float,
        clipping_pct: float,
        explanation: str
    ):
        self.overall_score = overall_score
        self.overall_label = overall_label
        self.sharpness_score = sharpness_score
        self.noise_level = noise_level
        self.contrast_score = contrast_score
        self.brightness_score = brightness_score
        self.clipping_pct = clipping_pct
        self.explanation = explanation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "overall_score": round(self.overall_score, 4),
            "overall_label": self.overall_label,
            "sharpness_score": round(self.sharpness_score, 2),
            "noise_level": round(self.noise_level, 4),
            "contrast_score": round(self.contrast_score, 2),
            "brightness_score": round(self.brightness_score, 2),
            "clipping_pct": round(self.clipping_pct, 2),
            "explanation": self.explanation
        }


class QualityService:
    @staticmethod
    def evaluate_quality(image_path: Path) -> ImageQualityAssessment:
        """
        Computes sharpness, noise, clipping, and illumination metrics.
        Returns ImageQualityAssessment.
        """
        img_bgr = cv2.imread(str(image_path))
        if img_bgr is None:
            return ImageQualityAssessment(
                overall_score=0.50,
                overall_label="MODERATE",
                sharpness_score=0.0,
                noise_level=0.0,
                contrast_score=0.0,
                brightness_score=0.0,
                clipping_pct=0.0,
                explanation="Could not inspect image pixels for quality scoring."
            )

        h, w = img_bgr.shape[:2]
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # 1. Sharpness / Blur via Laplacian variance
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = laplacian_var < 80.0

        # 2. Illumination & Contrast
        mean_brightness = float(np.mean(gray))
        contrast_std = float(np.std(gray))

        # 3. Dynamic Range / Pixel Clipping (under 5 or over 250)
        total_pixels = h * w
        clipped_pixels = np.sum(gray < 5) + np.sum(gray > 250)
        clipping_pct = float((clipped_pixels / total_pixels) * 100.0)

        # 4. Noise estimation using high-frequency residual
        # Difference between original and median blur
        blurred = cv2.medianBlur(gray, 3)
        noise_residual = np.abs(gray.astype(np.float32) - blurred.astype(np.float32))
        noise_level = float(np.mean(noise_residual))

        # Resolution heuristic
        is_high_res = (w >= 512 and h >= 512)
        is_low_res = (w < 200 or h < 200)

        # Scoring heuristic
        penalties = 0.0
        reasons = []

        if is_blurry:
            penalties += 0.25
            reasons.append("High blur detected (Laplacian variance < 80)")
        if clipping_pct > 15.0:
            penalties += 0.20
            reasons.append(f"Severe pixel clipping ({clipping_pct:.1f}%)")
        if contrast_std < 20.0:
            penalties += 0.15
            reasons.append("Low dynamic contrast")
        if is_low_res:
            penalties += 0.20
            reasons.append("Low resolution (< 200px)")
        if noise_level > 15.0:
            penalties += 0.15
            reasons.append("Heavy image noise/sensor artifacts")

        overall_score = max(0.20, min(0.95, 0.90 - penalties))
        if overall_score >= 0.75:
            overall_label = "GOOD"
            explanation = "Image quality is optimal for deep learning and frequency forensics."
        elif overall_score >= 0.50:
            overall_label = "MODERATE"
            explanation = f"Moderate quality ({', '.join(reasons)}). Forensic confidence may be mildly affected."
        else:
            overall_label = "POOR"
            explanation = f"Degraded image ({', '.join(reasons)}). Model confidence is reduced due to severe compression or blur."

        return ImageQualityAssessment(
            overall_score=overall_score,
            overall_label=overall_label,
            sharpness_score=laplacian_var,
            noise_level=noise_level,
            contrast_score=contrast_std,
            brightness_score=mean_brightness,
            clipping_pct=clipping_pct,
            explanation=explanation
        )
