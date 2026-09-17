"""Configuration module for DEEPTRACE-X backend.

Defines runtime settings, filesystem paths, security parameters,
and feature toggles.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server settings — HOST/PORT overridden by Railway/Render via environment variables
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "production"
    LOG_LEVEL: str = "INFO"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://*.netlify.app"

    # Base workspace directory (where project is running)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent

    # Storage paths
    STORAGE_DIR: Path = BASE_DIR / "data"
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    ANALYSES_DIR: Path = BASE_DIR / "data" / "analyses"
    MODEL_DIR: Path = BASE_DIR / "models" / "checkpoints"

    # Database
    DATABASE_URL: str = "sqlite:///./data/deeptrace.db"

    # Upload validation constraints
    MAX_UPLOAD_SIZE_MB: int = 20
    ALLOWED_MIME_TYPES: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]
    ALLOWED_EXTENSIONS: list[str] = [".jpg", ".jpeg", ".png", ".webp"]

    # Inference hardware
    DEFAULT_DEVICE: str = "cpu"
    USE_HALF_PRECISION: bool = False

    # Detector enablement flags
    ENABLE_EFFORT: bool = True
    ENABLE_LSDA: bool = True
    ENABLE_F3NET: bool = True
    ENABLE_SBI: bool = True
    ENABLE_XCEPTION: bool = True
    ENABLE_DINOV2: bool = True
    # Sightengine AI-Generated Image Detection API Settings
    SIGHTENGINE_API_USER: str = ""
    SIGHTENGINE_API_SECRET: str = ""
    SIGHTENGINE_API_URL: str = "https://api.sightengine.com/1.0/check.json"

    # AI Detection Decision Thresholds (Centralized)
    # Score represents Sightengine type.ai_generated in [0.0, 1.0]
    # >= 0.70 -> AI Generated
    # <= 0.30 -> Likely Real
    # 0.30 - 0.70 -> Uncertain
    AI_DETECTION_THRESHOLD_HIGH: float = 0.70
    AI_DETECTION_THRESHOLD_LOW: float = 0.30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def ensure_directories(self) -> None:
        """Ensure all required filesystem directories exist."""
        self.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.ANALYSES_DIR.mkdir(parents=True, exist_ok=True)
        self.MODEL_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
