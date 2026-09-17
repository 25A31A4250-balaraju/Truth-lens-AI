"""System health and resource diagnostic API routes."""

import shutil
import psutil
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database.database import get_db
from backend.models.model_registry import model_registry
from backend.schemas.model import SystemHealthResponse

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])


@router.get("", response_model=SystemHealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    # Memory metrics
    mem = psutil.virtual_memory()
    ram_total_gb = round(mem.total / (1024 ** 3), 2)
    ram_used_gb = round(mem.used / (1024 ** 3), 2)
    ram_percent = mem.percent

    # CPU metrics
    cpu_percent = psutil.cpu_percent(interval=None)

    # Disk metrics
    disk = shutil.disk_usage(str(settings.STORAGE_DIR))
    disk_free_gb = round(disk.free / (1024 ** 3), 2)

    # Test database connectivity
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    return SystemHealthResponse(
        status="ok" if db_connected else "degraded",
        version="1.0.0-alpha",
        environment=settings.ENVIRONMENT,
        device=f"{settings.DEFAULT_DEVICE.upper()} (Host CPU mode)",
        cpu_percent=cpu_percent,
        ram_used_gb=ram_used_gb,
        ram_total_gb=ram_total_gb,
        ram_percent=ram_percent,
        disk_free_gb=disk_free_gb,
        database_connected=db_connected,
        registered_models_count=model_registry.count_total_models()
    )


@router.get("/profile")
def get_performance_profile():
    """Returns granular memory and hardware profiling metrics."""
    from backend.utils.profiler import profiler
    return profiler.get_system_diagnostic_profile()


@router.post("/gc")
def trigger_garbage_collection():
    """Forces immediate Python garbage collection and tensor cache eviction."""
    from backend.utils.profiler import profiler
    return profiler.trigger_memory_cleanup()


@router.get("/sightengine")
def get_sightengine_status():
    """Returns safe diagnostic configuration status of Sightengine integration."""
    from backend.services.sightengine_service import SightengineService
    return {
        "is_configured": SightengineService.is_configured(),
        "model": "genai",
        "threshold_high": settings.AI_DETECTION_THRESHOLD_HIGH,
        "threshold_low": settings.AI_DETECTION_THRESHOLD_LOW
    }

