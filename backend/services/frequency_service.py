"""Forensic Frequency Signals Engine for DEEPTRACE-X.

Computes genuine mathematical 2D Fast Fourier Transform (FFT) decompositions:
- Extracts 2D centered log magnitude spectrum.
- Normalizes and exports visual Fourier spectrum image ({uuid}_fft.png).
- Computes concentric radial band energy partitioning (Low, Mid, High frequency %).
- Computes spectral entropy (Shannon entropy of power spectral density).
- Computes High-to-Low frequency energy ratios to flag synthetic lattice discrepancies.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import cv2
import numpy as np
from PIL import Image
from backend.config import settings
from backend.utils.logging_utils import logger


class FrequencyMetrics:
    def __init__(
        self,
        low_freq_energy_pct: float,
        mid_freq_energy_pct: float,
        high_freq_energy_pct: float,
        high_low_ratio: float,
        spectral_entropy: float,
        fft_image_path: str
    ):
        self.low_freq_energy_pct = low_freq_energy_pct
        self.mid_freq_energy_pct = mid_freq_energy_pct
        self.high_freq_energy_pct = high_freq_energy_pct
        self.high_low_ratio = high_low_ratio
        self.spectral_entropy = spectral_entropy
        self.fft_image_path = fft_image_path

    def to_dict(self) -> Dict[str, Any]:
        return {
            "low_freq_energy_pct": round(self.low_freq_energy_pct, 2),
            "mid_freq_energy_pct": round(self.mid_freq_energy_pct, 2),
            "high_freq_energy_pct": round(self.high_freq_energy_pct, 2),
            "high_low_ratio": round(self.high_low_ratio, 4),
            "spectral_entropy": round(self.spectral_entropy, 4),
            "fft_image_path": self.fft_image_path
        }


class FrequencyService:
    @staticmethod
    def analyze_frequency(
        image_path: Path,
        analysis_uuid: str
    ) -> FrequencyMetrics:
        """
        Executes genuine 2D-FFT spectral analysis on the image.
        Returns calculated FrequencyMetrics and exports a normalized magnitude image.
        """
        img_bgr = cv2.imread(str(image_path))
        if img_bgr is None:
            logger.warning(f"Could not load image for FFT: {image_path}")
            # Fallback zero metrics
            return FrequencyMetrics(0.0, 0.0, 0.0, 0.0, 0.0, "")

        # 1. Convert to grayscale luminance representation
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # 2. Compute 2D Fast Fourier Transform
        # Using optimal DFT size for CPU performance
        opt_h = cv2.getOptimalDFTSize(h)
        opt_w = cv2.getOptimalDFTSize(w)
        padded = cv2.copyMakeBorder(gray, 0, opt_h - h, 0, opt_w - w, cv2.BORDER_CONSTANT, value=0)

        # Compute complex 2D FFT using numpy
        f_transform = np.fft.fft2(padded)
        f_shifted = np.fft.fftshift(f_transform)

        # 3. Calculate magnitude spectrum (log scale)
        magnitude = np.abs(f_shifted)
        log_magnitude = 20 * np.log10(magnitude + 1e-6)

        # 4. Normalize to 8-bit [0, 255] for visual spectrum artifact
        norm_mag = cv2.normalize(log_magnitude, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        # Apply colormap for scientific visual clarity (INFERNO / JET)
        spectrum_colored = cv2.applyColorMap(norm_mag, cv2.COLORMAP_INFERNO)

        fft_filename = f"{analysis_uuid}_fft.png"
        fft_dest = settings.ANALYSES_DIR / fft_filename
        settings.ANALYSES_DIR.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(fft_dest), spectrum_colored)

        # 5. Concentric Radial Energy Band Partitioning
        # Center coordinates
        cy, cx = opt_h // 2, opt_w // 2
        y_indices, x_indices = np.ogrid[:opt_h, :opt_w]
        radial_dist = np.sqrt((x_indices - cx) ** 2 + (y_indices - cy) ** 2)
        max_radius = np.sqrt(cx ** 2 + cy ** 2)

        # Power spectrum (|F|^2)
        power_spectrum = magnitude ** 2
        total_energy = np.sum(power_spectrum) + 1e-12

        # Define 3 concentric radial frequency zones:
        # Low frequency: 0 to 15% of max radius (global shapes, general illumination)
        # Mid frequency: 15% to 50% of max radius (edges, structural features)
        # High frequency: 50% to 100% of max radius (fine textures, sensor noise, generative lattice artifacts)
        low_mask = radial_dist < (0.15 * max_radius)
        mid_mask = (radial_dist >= (0.15 * max_radius)) & (radial_dist < (0.50 * max_radius))
        high_mask = radial_dist >= (0.50 * max_radius)

        e_low = np.sum(power_spectrum[low_mask])
        e_mid = np.sum(power_spectrum[mid_mask])
        e_high = np.sum(power_spectrum[high_mask])

        pct_low = float((e_low / total_energy) * 100.0)
        pct_mid = float((e_mid / total_energy) * 100.0)
        pct_high = float((e_high / total_energy) * 100.0)

        high_low_ratio = float(e_high / (e_low + 1e-12))

        # 6. Spectral Entropy Calculation (Shannon entropy of normalized power density)
        p_density = (power_spectrum / total_energy).flatten()
        # Filter out zero probabilities for log calculation
        p_nonzero = p_density[p_density > 1e-12]
        spectral_entropy = float(-np.sum(p_nonzero * np.log2(p_nonzero)))

        return FrequencyMetrics(
            low_freq_energy_pct=pct_low,
            mid_freq_energy_pct=pct_mid,
            high_freq_energy_pct=pct_high,
            high_low_ratio=high_low_ratio,
            spectral_entropy=spectral_entropy,
            fft_image_path=str(fft_dest)
        )
