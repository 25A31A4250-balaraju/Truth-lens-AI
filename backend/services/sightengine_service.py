"""Sightengine AI-Generated Image Detection Service for DEEPTRACE-X.

Integrates Sightengine's GenAI detection model (https://api.sightengine.com/1.0/check.json)
to accurately detect AI-generated/synthetic images (Midjourney, DALL-E, Stable Diffusion, Flux, etc.)
versus authentic optical photographs.

Security Notice:
- Sightengine credentials (SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET) must remain server-side.
- Credentials are NEVER exposed to browser clients, logs, or git-tracked source files.
"""

from pathlib import Path
from typing import Dict, Any, Optional
import httpx
from backend.config import settings
from backend.utils.logging_utils import logger


class SightengineResult:
    def __init__(
        self,
        status: str,
        ai_generated_prob: Optional[float] = None,
        verdict: Optional[str] = None,
        verdict_label: Optional[str] = None,
        confidence: Optional[float] = None,
        raw_response: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        is_configured: bool = True
    ):
        self.status = status
        self.ai_generated_prob = round(ai_generated_prob, 4) if ai_generated_prob is not None else None
        self.verdict = verdict
        self.verdict_label = verdict_label
        self.confidence = round(confidence, 4) if confidence is not None else None
        self.raw_response = raw_response or {}
        self.error_message = error_message
        self.is_configured = is_configured

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "ai_generated_prob": self.ai_generated_prob,
            "verdict": self.verdict,
            "verdict_label": self.verdict_label,
            "confidence": self.confidence,
            "error_message": self.error_message,
            "is_configured": self.is_configured
        }


class SightengineService:
    @classmethod
    def is_configured(cls) -> bool:
        """
        Validates that Sightengine API credentials are set and non-empty.
        """
        user = (settings.SIGHTENGINE_API_USER or "").strip()
        secret = (settings.SIGHTENGINE_API_SECRET or "").strip()
        # Ensure not placeholder text
        if not user or not secret:
            return False
        if user in ["your_api_user", "your_api_user_here"] or secret in ["your_api_secret", "your_api_secret_here"]:
            return False
        return True

    @classmethod
    def detect_ai_generated(
        cls,
        image_path: Path,
        client: Optional[httpx.Client] = None
    ) -> SightengineResult:
        """
        Sends an image file to Sightengine's GenAI detection API endpoint
        and returns the AI-generated probability and calibrated verdict.
        """
        if not cls.is_configured():
            logger.warning("Sightengine API credentials (SIGHTENGINE_API_USER / SIGHTENGINE_API_SECRET) not set.")
            return SightengineResult(
                status="unconfigured",
                error_message=(
                    "Sightengine API credentials are not configured. "
                    "Please add SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET to your server .env file."
                ),
                is_configured=False
            )

        if not image_path.exists():
            return SightengineResult(
                status="file_not_found",
                error_message=f"Image file not found: {image_path.name}",
                is_configured=True
            )

        # Prepare multipart/form-data payload
        data_payload = {
            "models": "genai",
            "api_user": settings.SIGHTENGINE_API_USER.strip(),
            "api_secret": settings.SIGHTENGINE_API_SECRET.strip()
        }

        # Resolve MIME type
        ext = image_path.suffix.lower()
        mime_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp"
        }
        content_type = mime_map.get(ext, "image/jpeg")

        try:
            with open(image_path, "rb") as img_file:
                files = {
                    "media": (image_path.name, img_file, content_type)
                }

                # Use injected or new httpx client
                if client is not None:
                    response = client.post(
                        settings.SIGHTENGINE_API_URL,
                        data=data_payload,
                        files=files,
                        timeout=25.0
                    )
                else:
                    with httpx.Client(timeout=25.0) as http_client:
                        response = http_client.post(
                            settings.SIGHTENGINE_API_URL,
                            data=data_payload,
                            files=files
                        )

            # Check HTTP status
            if response.status_code != 200:
                logger.error(f"Sightengine API returned HTTP {response.status_code}")
                # Parse error if available without exposing secrets
                try:
                    err_json = response.json()
                    err_msg = err_json.get("error", {}).get("message", f"API HTTP status {response.status_code}")
                except Exception:
                    err_msg = f"Sightengine API HTTP status {response.status_code}"

                return SightengineResult(
                    status="api_error",
                    error_message=f"Sightengine error: {err_msg}",
                    is_configured=True
                )

            # Parse JSON response
            resp_data = response.json()

            # Check Sightengine API status
            if resp_data.get("status") == "failure":
                err_info = resp_data.get("error", {})
                err_msg = err_info.get("message", "Sightengine reported an unknown failure")
                logger.error(f"Sightengine API failure: {err_msg}")
                return SightengineResult(
                    status="failure",
                    error_message=f"Sightengine rejected image: {err_msg}",
                    raw_response=resp_data,
                    is_configured=True
                )

            # Extract type.ai_generated probability (Source of Truth)
            type_info = resp_data.get("type", {})
            if "ai_generated" not in type_info:
                logger.error(f"Sightengine response missing 'type.ai_generated': {resp_data}")
                return SightengineResult(
                    status="invalid_response",
                    error_message="Sightengine response missing 'ai_generated' probability field.",
                    raw_response=resp_data,
                    is_configured=True
                )

            ai_prob = float(type_info["ai_generated"])
            ai_prob = max(0.0, min(1.0, ai_prob))

            # Apply centralized decision thresholds
            high_thresh = settings.AI_DETECTION_THRESHOLD_HIGH
            low_thresh = settings.AI_DETECTION_THRESHOLD_LOW

            if ai_prob >= high_thresh:
                verdict = "AI_GENERATED"
                verdict_label = "AI Generated"
                confidence = ai_prob
            elif ai_prob <= low_thresh:
                verdict = "LIKELY_REAL"
                verdict_label = "Likely Real"
                confidence = 1.0 - ai_prob
            else:
                verdict = "UNCERTAIN"
                verdict_label = "Uncertain"
                confidence = ai_prob

            # Sanitize raw response to ensure credentials never persist
            sanitized_raw = {
                "request_id": resp_data.get("request", {}).get("id"),
                "operations": resp_data.get("request", {}).get("operations"),
                "ai_generated": ai_prob
            }

            logger.info(
                f"[Sightengine] Analysis completed for {image_path.name}: "
                f"ai_generated={ai_prob:.2%}, verdict={verdict_label}"
            )

            return SightengineResult(
                status="success",
                ai_generated_prob=ai_prob,
                verdict=verdict,
                verdict_label=verdict_label,
                confidence=confidence,
                raw_response=sanitized_raw,
                is_configured=True
            )

        except httpx.TimeoutException:
            logger.error(f"Sightengine request timed out after 25s for {image_path.name}")
            return SightengineResult(
                status="timeout",
                error_message="Sightengine API request timed out. The service may be experiencing high load.",
                is_configured=True
            )
        except httpx.NetworkError as ne:
            logger.error(f"Sightengine network error: {ne}")
            return SightengineResult(
                status="network_error",
                error_message="Could not reach Sightengine API. Please check your internet connection.",
                is_configured=True
            )
        except Exception as e:
            logger.error(f"Unexpected error in SightengineService: {e}")
            # Ensure no secret or internal tokens are leaked
            safe_msg = str(e).replace(settings.SIGHTENGINE_API_SECRET, "***") if settings.SIGHTENGINE_API_SECRET else str(e)
            return SightengineResult(
                status="error",
                error_message=f"An unexpected error occurred during AI image detection: {safe_msg}",
                is_configured=True
            )
