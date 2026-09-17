"""Model registry and capability inspection API routes."""

from typing import List, Dict, Any
from fastapi import APIRouter
from backend.models.model_registry import model_registry

router = APIRouter(prefix="/models", tags=["Model Laboratory"])


@router.get("", response_model=List[Dict[str, Any]])
def list_system_models():
    """Lists all configured forensic models and their local checkpoint readiness."""
    return model_registry.list_models()
