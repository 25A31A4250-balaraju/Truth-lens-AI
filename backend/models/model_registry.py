"""Model Registry for DEEPTRACE-X forensics detectors.

Provides centralized orchestration of all multi-signal models:
- Effort (Spatial / Generalization detector)
- LSDA (Cross-manipulation generalization)
- F3Net (Frequency-domain artifact detector)
- SBI (Self-blended images detector)
- Xception (Conventional benchmark baseline)
- DINOv2 (Frozen foundation semantic representation)

Enforces sequential CPU execution with automatic memory unmounting to protect the 16 GB RAM ceiling.
"""

from pathlib import Path
from typing import Dict, List, Optional, Any
from backend.config import settings
from backend.utils.logging_utils import logger
from backend.models.base_adapter import BaseDetectorAdapter
from backend.models.xception_adapter import XceptionAdapter
from backend.models.effort_adapter import EffortAdapter
from backend.models.lsda_adapter import LSDAAdapter
from backend.models.f3net_adapter import F3NetAdapter
from backend.models.sbi_adapter import SBIAdapter
from backend.models.dinov2_adapter import DINOv2Adapter


class ModelRegistry:
    def __init__(self):
        self._adapters: Dict[str, BaseDetectorAdapter] = {}
        self._register_default_adapters()

    def _register_default_adapters(self) -> None:
        """Initializes all 6 multi-signal forensic adapters."""
        self._adapters["Xception"] = XceptionAdapter()
        self._adapters["Effort"] = EffortAdapter()
        self._adapters["LSDA"] = LSDAAdapter()
        self._adapters["F3Net"] = F3NetAdapter()
        self._adapters["SBI"] = SBIAdapter()
        self._adapters["DINOv2"] = DINOv2Adapter()

    def get_adapter(self, name: str) -> Optional[BaseDetectorAdapter]:
        return self._adapters.get(name)

    def get_model(self, name: str) -> Optional[BaseDetectorAdapter]:
        """Alias for get_adapter."""
        return self.get_adapter(name)

    def is_model_enabled(self, name: str) -> bool:
        flag_map = {
            "Effort": settings.ENABLE_EFFORT,
            "LSDA": settings.ENABLE_LSDA,
            "F3Net": settings.ENABLE_F3NET,
            "SBI": settings.ENABLE_SBI,
            "Xception": settings.ENABLE_XCEPTION,
            "DINOv2": settings.ENABLE_DINOV2,
        }
        return flag_map.get(name, True)

    def list_models(self) -> List[Dict[str, Any]]:
        result = []
        for name, adapter in self._adapters.items():
            enabled = self.is_model_enabled(name)
            status = adapter.status if enabled else "DISABLED"
            result.append({
                "name": adapter.name,
                "version": adapter.version,
                "category": adapter.category,
                "expected_checkpoint": adapter.expected_checkpoint,
                "checkpoint_available": adapter.is_checkpoint_available,
                "status": status,
                "device": adapter.device,
                "input_resolution": f"{adapter.input_size[0]}x{adapter.input_size[1]}",
                "description": (
                    f"{adapter.name} detector module. "
                    f"{'Weights staged and ready.' if adapter.is_checkpoint_available else 'Awaiting local checkpoint file.'}"
                )
            })
        return result

    def count_ready_models(self) -> int:
        return sum(1 for m in self.list_models() if m["status"] == "READY")

    def count_total_models(self) -> int:
        return len(self._adapters)

    def run_inference_pipeline(
        self,
        target_path: Path,
        sequential_unload: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Executes inference sequentially across all enabled models on CPU.
        Unloads each model immediately after inference to conserve host memory.
        """
        predictions: List[Dict[str, Any]] = []

        for name, adapter in self._adapters.items():
            if not self.is_model_enabled(name):
                predictions.append({
                    "model_name": name,
                    "model_version": adapter.version,
                    "prediction": "UNCERTAIN",
                    "confidence": 0.50,
                    "processing_time_ms": 0.0,
                    "status": "DISABLED",
                    "error_message": "Module disabled in settings"
                })
                continue

            # Run prediction through adapter
            pred_dict = adapter.predict(target_path, auto_unload=sequential_unload)
            predictions.append(pred_dict)

        return predictions


# Global singleton registry
model_registry = ModelRegistry()
