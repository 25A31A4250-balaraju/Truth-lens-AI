"""Interpretable Fusion Engine for DEEPTRACE-X.

Decomposes forensic evaluation into four distinct scientific modalities:
1. Spatial Modality: Local patch gradients, facial structure, pixel anomalies (Effort, Xception).
2. Frequency Modality: Fourier spectral energy, high-to-low ratio, entropy (F3Net, 2D-FFT).
3. Boundary Modality: Blending boundary inconsistencies, edge discrepancies (SBI).
4. Semantic Modality: Generalization representations, manifold alignment (LSDA, DINOv2).

Computes quality-conditioned dynamic weights and provides transparent percentage contributions:
C_m = (|w_m * x_m| / sum(|w_k * x_k|)) * 100%.
"""

from typing import Dict, Any, List, Optional
import numpy as np

from backend.database.models import ModelPrediction, EvidenceItem
from backend.services.quality_service import ImageQualityAssessment
from backend.services.frequency_service import FrequencyMetrics
from backend.services.ood_service import OODAssessment
from backend.utils.logging_utils import logger


class ModalityScore:
    def __init__(self, name: str, raw_score: float, weight: float, contribution_pct: float, source_signals: List[str]):
        self.name = name
        self.raw_score = round(raw_score, 4)
        self.weight = round(weight, 4)
        self.contribution_pct = round(contribution_pct, 1)
        self.source_signals = source_signals

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "raw_score": self.raw_score,
            "weight": self.weight,
            "contribution_pct": self.contribution_pct,
            "source_signals": self.source_signals
        }


class FusionResult:
    def __init__(
        self,
        fused_score: float,
        modalities: Dict[str, ModalityScore],
        explanation: str,
        evidence_item: EvidenceItem
    ):
        self.fused_score = round(fused_score, 4)
        self.modalities = modalities
        self.explanation = explanation
        self.evidence_item = evidence_item

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fused_score": self.fused_score,
            "modalities": {k: v.to_dict() for k, v in self.modalities.items()},
            "explanation": self.explanation
        }


class FusionService:
    @classmethod
    def fuse_forensic_modalities(
        cls,
        predictions: List[ModelPrediction],
        quality: ImageQualityAssessment,
        frequency_metrics: Optional[FrequencyMetrics] = None,
        ood_assessment: Optional[OODAssessment] = None,
        top_patch_score: Optional[float] = None
    ) -> FusionResult:
        """
        Combines spatial, frequency, boundary, and semantic signals into an
        interpretable multi-modal fusion assessment with percentage contributions.
        """
        pred_map = {p.model_name: p for p in predictions}

        # 1. Extract Spatial Modality Score (x_spatial)
        # Sources: Effort (spatial CNN), Xception (spatial baseline), patch gradient
        spatial_components = []
        spatial_sources = []
        if "Effort" in pred_map and pred_map["Effort"].status in ["READY", "COMPLETED"]:
            p = pred_map["Effort"]
            val = p.confidence if p.prediction == "FAKE" else (1.0 - p.confidence)
            spatial_components.append(val)
            spatial_sources.append("Effort (ConvNeXt)")
        if "Xception" in pred_map and pred_map["Xception"].status in ["READY", "COMPLETED"]:
            p = pred_map["Xception"]
            val = p.confidence if p.prediction == "FAKE" else (1.0 - p.confidence)
            spatial_components.append(val)
            spatial_sources.append("Xception (FF++)")
        if top_patch_score is not None:
            # Normalize top patch anomaly score to [0, 1]
            val = top_patch_score if top_patch_score <= 1.0 else (top_patch_score / 100.0)
            spatial_components.append(min(1.0, max(0.05, val)))
            spatial_sources.append("Patch Gradient Texture")

        x_spatial = float(np.mean(spatial_components)) if spatial_components else 0.18
        if not spatial_sources:
            spatial_sources = ["Spatial Baseline (Natural Gradients)"]

        # 2. Extract Frequency Modality Score (x_frequency)
        # Sources: F3Net, 2D-FFT High-to-Low ratio
        freq_components = []
        freq_sources = []
        if "F3Net" in pred_map and pred_map["F3Net"].status in ["READY", "COMPLETED"]:
            p = pred_map["F3Net"]
            val = p.confidence if p.prediction == "FAKE" else (1.0 - p.confidence)
            freq_components.append(val)
            freq_sources.append("F3Net (Dual-Stream)")
        if frequency_metrics:
            # High-to-low ratio anomaly: natural photos have ratio <= 0.0015
            ratio_val = frequency_metrics.high_low_ratio
            if ratio_val >= 0.0035:
                ratio_anomaly = min(0.92, 0.65 + (ratio_val - 0.0035) * 40.0)
            elif ratio_val <= 0.0015:
                ratio_anomaly = max(0.04, 0.04 + (ratio_val / 0.0015) * 0.10)
            else:
                ratio_anomaly = 0.35
            freq_components.append(ratio_anomaly)
            freq_sources.append("2D-FFT Radial High/Low Ratio")

        x_frequency = float(np.mean(freq_components)) if freq_components else 0.18
        if not freq_sources:
            freq_sources = ["Frequency Baseline (Natural 1/f Spectrum)"]

        # 3. Extract Boundary Modality Score (x_boundary)
        # Source: SBI (Self-Blending Images boundary anomaly detector)
        boundary_sources = []
        if "SBI" in pred_map and pred_map["SBI"].status in ["READY", "COMPLETED"]:
            p = pred_map["SBI"]
            x_boundary = p.confidence if p.prediction == "FAKE" else (1.0 - p.confidence)
            boundary_sources.append("SBI (Self-Blending Boundary)")
        else:
            x_boundary = 0.15
            boundary_sources.append("Boundary Baseline (Natural Seam Continuity)")

        # 4. Extract Semantic Modality Score (x_semantic)
        # Sources: LSDA (generalization), DINOv2 OOD distance
        semantic_components = []
        semantic_sources = []
        if "LSDA" in pred_map and pred_map["LSDA"].status in ["READY", "COMPLETED"]:
            p = pred_map["LSDA"]
            val = p.confidence if p.prediction == "FAKE" else (1.0 - p.confidence)
            semantic_components.append(val)
            semantic_sources.append("LSDA (Cross-Architecture)")
        if ood_assessment:
            # OOD score indicates semantic manifold divergence
            semantic_components.append(ood_assessment.ood_score)
            semantic_sources.append("DINOv2 ViT Foundation Distance")

        x_semantic = float(np.mean(semantic_components)) if semantic_components else 0.18
        if not semantic_sources:
            semantic_sources = ["Semantic Baseline (In-Distribution)"]

        # Quality-Conditioned Dynamic Weight Allocation
        # Base balanced weights
        w_spatial = 0.30
        w_freq = 0.25
        w_boundary = 0.25
        w_semantic = 0.20

        # When quality is degraded, attenuate spatial and boundary weights
        # because high-frequency compression and blur disrupt edge/pixel detectors
        if quality.overall_score < 0.70:
            deg_factor = max(0.40, quality.overall_score / 0.70)
            w_spatial *= deg_factor
            w_boundary *= deg_factor
            # Compensate by boosting robust frequency & semantic weights
            w_freq *= 1.25
            w_semantic *= 1.25

        # Normalize weights to sum to 1.0
        total_w = w_spatial + w_freq + w_boundary + w_semantic
        w_spatial /= total_w
        w_freq /= total_w
        w_boundary /= total_w
        w_semantic /= total_w

        # Compute Fused Score
        fused_score = (
            (w_spatial * x_spatial) +
            (w_freq * x_frequency) +
            (w_boundary * x_boundary) +
            (w_semantic * x_semantic)
        )

        # Calculate exact percentage contributions: C_m = |w_m * x_m| / sum(|w_k * x_k|)
        contributions = {
            "spatial": abs(w_spatial * x_spatial),
            "frequency": abs(w_freq * x_frequency),
            "boundary": abs(w_boundary * x_boundary),
            "semantic": abs(w_semantic * x_semantic)
        }
        total_contrib = sum(contributions.values())
        if total_contrib > 1e-6:
            pct_spatial = (contributions["spatial"] / total_contrib) * 100.0
            pct_freq = (contributions["frequency"] / total_contrib) * 100.0
            pct_boundary = (contributions["boundary"] / total_contrib) * 100.0
            pct_semantic = (contributions["semantic"] / total_contrib) * 100.0
        else:
            pct_spatial = pct_freq = pct_boundary = pct_semantic = 25.0

        modalities = {
            "spatial": ModalityScore("Spatial", x_spatial, w_spatial, pct_spatial, spatial_sources),
            "frequency": ModalityScore("Frequency", x_frequency, w_freq, pct_freq, freq_sources),
            "boundary": ModalityScore("Boundary", x_boundary, w_boundary, pct_boundary, boundary_sources),
            "semantic": ModalityScore("Semantic", x_semantic, w_semantic, pct_semantic, semantic_sources)
        }

        explanation = (
            f"Multi-Modal Fusion Breakdown: Spatial ({pct_spatial:.1f}%, score: {x_spatial:.2f}), "
            f"Frequency ({pct_freq:.1f}%, score: {x_frequency:.2f}), "
            f"Boundary ({pct_boundary:.1f}%, score: {x_boundary:.2f}), "
            f"Semantic ({pct_semantic:.1f}%, score: {x_semantic:.2f}). "
            f"Quality-conditioned weights applied."
        )

        evidence_item = EvidenceItem(
            evidence_type="FUSION_DECOMPOSITION",
            score=round(fused_score, 4),
            description=explanation,
            source_model="FusionEngine (Multi-Modal Linear Combination)"
        )

        return FusionResult(
            fused_score=fused_score,
            modalities=modalities,
            explanation=explanation,
            evidence_item=evidence_item
        )
