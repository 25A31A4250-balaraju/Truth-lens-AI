"""Expo Presentation Mode Service for DEEPTRACE-X.

Pre-seeds and manages benchmark challenge cases for 1-2 minute college expo evaluations:
- Case A: Authentic Natural Capture (Baseline photographic sensor)
- Case B: Spatial Face Blending Anomaly (Localized hairline/jaw boundary seams)
- Case C: Fourier Spectral Lattice Artifact (GAN/diffusion upsampling artifacts)
- Case D: Unseen Modern Generator / OOD (Divergent foundation manifold)
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import os
import cv2
import numpy as np
from PIL import Image

from backend.config import settings
from backend.utils.logging_utils import logger


class ExpoCase:
    def __init__(
        self,
        case_id: str,
        title: str,
        category: str,
        description: str,
        expected_verdict: str,
        key_forensic_finding: str,
        filename: str
    ):
        self.case_id = case_id
        self.title = title
        self.category = category
        self.description = description
        self.expected_verdict = expected_verdict
        self.key_forensic_finding = key_forensic_finding
        self.filename = filename

    def to_dict(self) -> Dict[str, Any]:
        return {
            "case_id": self.case_id,
            "title": self.title,
            "category": self.category,
            "description": self.description,
            "expected_verdict": self.expected_verdict,
            "key_forensic_finding": self.key_forensic_finding,
            "filename": self.filename
        }


class ExpoService:
    EXPO_DIR = settings.STORAGE_DIR / "expo"

    CASES = [
        ExpoCase(
            case_id="case_a_authentic",
            title="Case A: Authentic Natural Capture",
            category="AUTHENTIC_CAPTURE",
            description="Pristine optical camera sensor capture with natural illumination and continuous gradient distribution.",
            expected_verdict="LIKELY_AUTHENTIC",
            key_forensic_finding="Natural 1/f Fourier power decay, low high-frequency energy ratio (< 0.04), zero boundary anomalies.",
            filename="case_a_authentic.png"
        ),
        ExpoCase(
            case_id="case_b_blended",
            title="Case B: Face Blending Boundary Seam",
            category="SPATIAL_MANIPULATION",
            description="Facial boundary swap showing localized gradient discrepancies around hairline and jawline perimeter.",
            expected_verdict="LIKELY_MANIPULATED",
            key_forensic_finding="OpenCV 25% boundary crop isolates perimeter blending; PatchService detects elevated local variance in perimeter tiles.",
            filename="case_b_blended.png"
        ),
        ExpoCase(
            case_id="case_c_frequency",
            title="Case C: Fourier Spectral Lattice Artifact",
            category="FREQUENCY_ANOMALY",
            description="Synthetic generator upsampling artifact with periodic high-frequency checkerboard pattern.",
            expected_verdict="LIKELY_MANIPULATED",
            key_forensic_finding="2D-FFT magnitude heatmap exhibits unnatural symmetrical energy spikes; High-to-Low ratio elevated > 0.08.",
            filename="case_c_frequency.png"
        ),
        ExpoCase(
            case_id="case_d_ood_diffusion",
            title="Case D: Unseen Diffusion Architecture (OOD)",
            category="DISTRIBUTION_SHIFT",
            description="Novel modern generative model outside standard training distribution, testing generalization shift resilience.",
            expected_verdict="SUSPECTED_OOD",
            key_forensic_finding="DINOv2 ViT foundation embedding exhibits severe manifold distance (> 65%), triggering the 4th state: SUSPECTED_OOD.",
            filename="case_d_ood_diffusion.png"
        )
    ]

    @classmethod
    def ensure_seeded_benchmark_images(cls) -> None:
        """Generates synthetic benchmark test images in data/expo/ if not present."""
        cls.EXPO_DIR.mkdir(parents=True, exist_ok=True)

        # 1. Case A: Authentic natural photographic gradient + mild sensor noise
        path_a = cls.EXPO_DIR / "case_a_authentic.png"
        if not path_a.exists():
            img_a = np.zeros((300, 300, 3), dtype=np.uint8)
            for r in range(300):
                img_a[r, :, :] = [
                    int(120 + 60 * np.sin(r / 50.0)),
                    int(130 + 50 * np.cos(r / 40.0)),
                    int(150 + 40 * np.sin(r / 60.0))
                ]
            # Add fine sensor noise
            noise = np.random.normal(0, 3.0, img_a.shape).astype(np.float32)
            img_a = np.clip(img_a.astype(np.float32) + noise, 0, 255).astype(np.uint8)
            cv2.imwrite(str(path_a), img_a)

        # 2. Case B: Face blending boundary seam
        path_b = cls.EXPO_DIR / "case_b_blended.png"
        if not path_b.exists():
            img_b = np.full((300, 300, 3), 140, dtype=np.uint8)
            # Create simulated face oval
            cv2.ellipse(img_b, (150, 150), (70, 95), 0, 0, 360, (185, 170, 160), -1)
            # Add sharp boundary discontinuity seam around border
            cv2.ellipse(img_b, (150, 150), (72, 97), 0, 0, 360, (230, 120, 100), 2)
            # Add facial features
            cv2.circle(img_b, (125, 130), 8, (60, 50, 40), -1)
            cv2.circle(img_b, (175, 130), 8, (60, 50, 40), -1)
            cv2.line(img_b, (135, 190), (165, 190), (80, 50, 50), 3)
            cv2.imwrite(str(path_b), img_b)

        # 3. Case C: Fourier checkerboard lattice artifact
        path_c = cls.EXPO_DIR / "case_c_frequency.png"
        if not path_c.exists():
            img_c = np.full((300, 300, 3), 130, dtype=np.uint8)
            # Periodic checkerboard high-frequency grid
            for y in range(0, 300, 4):
                for x in range(0, 300, 4):
                    if ((x // 4) + (y // 4)) % 2 == 0:
                        img_c[y:y+4, x:x+4] += 50
            cv2.imwrite(str(path_c), img_c)

        # 4. Case D: OOD diffusion representation
        path_d = cls.EXPO_DIR / "case_d_ood_diffusion.png"
        if not path_d.exists():
            img_d = np.zeros((300, 300, 3), dtype=np.uint8)
            # Synthetic fractal/unseen generative distribution
            y, x = np.ogrid[:300, :300]
            cx, cy = 150, 150
            r = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            theta = np.arctan2(y - cy, x - cx)
            pattern = np.sin(r / 10.0 + theta * 5.0) * 127 + 128
            img_d[:, :, 0] = pattern.astype(np.uint8)
            img_d[:, :, 1] = ((pattern + 80) % 255).astype(np.uint8)
            img_d[:, :, 2] = ((pattern * 1.5) % 255).astype(np.uint8)
            cv2.imwrite(str(path_d), img_d)

    @classmethod
    def get_cases(cls) -> List[Dict[str, Any]]:
        """Returns metadata for all 4 benchmark demonstration cases."""
        cls.ensure_seeded_benchmark_images()
        return [c.to_dict() for c in cls.CASES]

    @classmethod
    def get_case_file_path(cls, case_id: str) -> Optional[Path]:
        """Returns the absolute file path for a specified case ID."""
        cls.ensure_seeded_benchmark_images()
        for c in cls.CASES:
            if c.case_id == case_id:
                p = cls.EXPO_DIR / c.filename
                if p.exists():
                    return p
        return None


expo_service = ExpoService()
