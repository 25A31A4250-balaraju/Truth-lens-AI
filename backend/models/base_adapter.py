"""Base Detector Adapter Interface for DEEPTRACE-X Forensic Models.

Defines the contract for CPU execution, lazy-loading, memory recycling,
and standardized prediction output across all multi-signal models.
"""

import abc
import gc
import time
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from backend.config import settings
from backend.utils.logging_utils import logger


class BaseDetectorAdapter(abc.ABC):
    def __init__(
        self,
        name: str,
        version: str,
        category: str,
        expected_checkpoint: str,
        input_size: Tuple[int, int] = (224, 224),
        device: str = "cpu"
    ):
        self.name = name
        self.version = version
        self.category = category
        self.expected_checkpoint = expected_checkpoint
        self.input_size = input_size
        self.device = device
        self.model: Optional[Any] = None

    @property
    def checkpoint_path(self) -> Path:
        return settings.MODEL_DIR / self.expected_checkpoint

    @property
    def is_checkpoint_available(self) -> bool:
        return self.checkpoint_path.is_file()

    @property
    def status(self) -> str:
        if self.is_checkpoint_available:
            return "READY"
        return "STANDBY_NO_CHECKPOINT"

    @abc.abstractmethod
    def _build_model_architecture(self) -> Any:
        """Constructs the neural network module."""
        pass

    def load_model(self) -> bool:
        """Lazy-loads model weights onto CPU if checkpoint is present."""
        if not self.is_checkpoint_available:
            logger.info(f"[{self.name}] Checkpoint '{self.expected_checkpoint}' not found; remaining in STANDBY.")
            return False

        try:
            import torch
            logger.info(f"[{self.name}] Loading model weights from {self.checkpoint_path} onto {self.device}...")
            self.model = self._build_model_architecture()
            state_dict = torch.load(str(self.checkpoint_path), map_location=self.device, mmap=True)
            if "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]
            self.model.load_state_dict(state_dict, strict=False)
            self.model.to(self.device)
            self.model.eval()
            logger.info(f"[{self.name}] Model successfully initialized on {self.device}.")
            return True
        except Exception as e:
            logger.error(f"[{self.name}] Failed to load checkpoint: {e}")
            self.model = None
            return False

    def unload_model(self) -> None:
        """Explicitly frees model weights and triggers garbage collection to protect 16 GB RAM."""
        if self.model is not None:
            del self.model
            self.model = None
            gc.collect()
            logger.info(f"[{self.name}] Model weights unmounted; memory recycled.")

    @abc.abstractmethod
    def preprocess_image(self, image_path: Path) -> Any:
        """Converts image file to standardized model input tensor."""
        pass

    def predict(self, image_path: Path, auto_unload: bool = True) -> Dict[str, Any]:
        """
        Runs inference on image target with automatic lazy loading, timing,
        and immediate post-inference memory unloading.
        """
        if not self.is_checkpoint_available:
            return {
                "model_name": self.name,
                "model_version": self.version,
                "prediction": "UNCERTAIN",
                "confidence": 0.50,
                "processing_time_ms": 0.0,
                "status": "STANDBY_NO_CHECKPOINT",
                "error_message": f"Checkpoint '{self.expected_checkpoint}' pending in models/checkpoints/"
            }

        start_time = time.time()
        try:
            import torch
            if self.model is None:
                success = self.load_model()
                if not success:
                    return {
                        "model_name": self.name,
                        "model_version": self.version,
                        "prediction": "UNCERTAIN",
                        "confidence": 0.50,
                        "processing_time_ms": 0.0,
                        "status": "FAILED",
                        "error_message": "Could not initialize model weights"
                    }

            tensor = self.preprocess_image(image_path)
            with torch.no_grad():
                output = self.model(tensor)
                # Standard binary classification output
                if output.shape[-1] == 1:
                    prob_fake = torch.sigmoid(output).item()
                else:
                    probs = torch.softmax(output, dim=-1)
                    prob_fake = probs[0, 1].item()

            latency_ms = round((time.time() - start_time) * 1000, 2)
            prediction = "FAKE" if prob_fake >= 0.50 else "REAL"
            confidence = prob_fake if prediction == "FAKE" else (1.0 - prob_fake)

            result = {
                "model_name": self.name,
                "model_version": self.version,
                "prediction": prediction,
                "confidence": round(confidence, 4),
                "processing_time_ms": latency_ms,
                "status": "COMPLETED",
                "error_message": None
            }

        except Exception as e:
            logger.error(f"[{self.name}] Inference error: {e}")
            result = {
                "model_name": self.name,
                "model_version": self.version,
                "prediction": "UNCERTAIN",
                "confidence": 0.50,
                "processing_time_ms": round((time.time() - start_time) * 1000, 2),
                "status": "FAILED",
                "error_message": str(e)
            }
        finally:
            if auto_unload:
                self.unload_model()

        return result
