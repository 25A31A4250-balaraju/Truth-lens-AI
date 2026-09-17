"""Spatial Patch Decomposition and Suspicious Region Localization Service.

Implements grid-level spatial partitioning (4x4):
- Decomposes target region (facial crop or full frame) into 16 discrete inspection tiles.
- Computes local gradient variance and spatial artifact density.
- Generates ranked suspicious region coordinates for explainability overlay.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import cv2
import numpy as np
from backend.utils.logging_utils import logger


class PatchRegion:
    def __init__(
        self,
        patch_id: int,
        x: int,
        y: int,
        width: int,
        height: int,
        score: float,
        rank: int = 0
    ):
        self.patch_id = patch_id
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.score = score
        self.rank = rank

    def to_dict(self) -> Dict[str, Any]:
        return {
            "patch_id": self.patch_id,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "score": round(self.score, 4),
            "rank": self.rank
        }


class PatchService:
    @staticmethod
    def generate_grid_patches(
        image_path: Path,
        bounding_box: Optional[Dict[str, int]] = None,
        rows: int = 4,
        cols: int = 4
    ) -> List[PatchRegion]:
        """
        Decomposes the specified region (or full image if bounding_box is None)
        into a rows x cols grid of patches and scores spatial anomalies.
        """
        img_bgr = cv2.imread(str(image_path))
        if img_bgr is None:
            logger.warning(f"Could not load image for patch analysis: {image_path}")
            return []

        h_img, w_img = img_bgr.shape[:2]

        if bounding_box:
            base_x = max(0, min(bounding_box.get("x", 0), w_img - 10))
            base_y = max(0, min(bounding_box.get("y", 0), h_img - 10))
            base_w = max(10, min(bounding_box.get("width", w_img), w_img - base_x))
            base_h = max(10, min(bounding_box.get("height", h_img), h_img - base_y))
        else:
            base_x, base_y = 0, 0
            base_w, base_h = w_img, h_img

        patch_w = base_w // cols
        patch_h = base_h // rows

        if patch_w < 4 or patch_h < 4:
            logger.warning(f"Region too small for {rows}x{cols} patch decomposition.")
            return []

        patches: List[PatchRegion] = []
        raw_scores: List[float] = []

        patch_idx = 0
        for r in range(rows):
            for c in range(cols):
                px = base_x + c * patch_w
                py = base_y + r * patch_h
                # Adjust last row/col to capture remaining pixels
                pw = (base_w - c * patch_w) if c == cols - 1 else patch_w
                ph = (base_h - r * patch_h) if r == rows - 1 else patch_h

                tile = img_bgr[py:py+ph, px:px+pw]
                if tile.size == 0:
                    continue

                # Anomaly heuristic:
                # 1. Laplacian variance (high-frequency sharpness / boundary noise)
                gray_tile = cv2.cvtColor(tile, cv2.COLOR_BGR2GRAY)
                laplacian_var = cv2.Laplacian(gray_tile, cv2.CV_64F).var()

                # 2. Local standard deviation across color channels
                std_dev = np.std(tile)

                # Combined raw anomaly metric
                raw_score = float(laplacian_var * 0.6 + std_dev * 0.4)
                raw_scores.append(raw_score)

                patches.append(
                    PatchRegion(
                        patch_id=patch_idx,
                        x=int(px),
                        y=int(py),
                        width=int(pw),
                        height=int(ph),
                        score=raw_score
                    )
                )
                patch_idx += 1

        # Calibrate patch anomaly scores based on localized gradient deviation
        if raw_scores:
            med_s = float(np.median(raw_scores))
            std_s = float(np.std(raw_scores))

            # Assign rank 1..N based on raw anomaly descending
            sorted_by_raw = sorted(patches, key=lambda p: p.score, reverse=True)
            for rank_idx, p in enumerate(sorted_by_raw, 1):
                p.rank = rank_idx

            for p in patches:
                if std_s > 1e-3 and med_s > 1e-3:
                    rel_dev = max(0.0, (p.score - med_s) / (med_s + 10.0))
                    z_score = max(0.0, (p.score - med_s) / (std_s + 1e-4))
                    # Natural biological variation (eyes, mouth) stays between 0.08 - 0.28
                    # Splicing and synthetic artifact spikes elevate up to 0.85+
                    norm_score = 0.08 + 0.08 * min(1.0, rel_dev / 3.0) + 0.09 * min(1.0, z_score / 3.0)
                    if rel_dev > 5.0:
                        norm_score += min(0.65, (rel_dev - 5.0) * 0.08)
                else:
                    norm_score = 0.10

                p.score = round(float(np.clip(norm_score, 0.05, 0.95)), 4)

        return sorted(patches, key=lambda p: p.patch_id)
