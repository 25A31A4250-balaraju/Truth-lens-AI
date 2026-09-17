"""Pydantic schemas for registered forensic models and health checks."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SystemModelSchema(BaseModel):
    id: Optional[int] = None
    name: str
    version: str
    checkpoint_path: Optional[str] = None
    status: str
    device: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SystemHealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    device: str
    cpu_percent: float
    ram_used_gb: float
    ram_total_gb: float
    ram_percent: float
    disk_free_gb: float
    database_connected: bool
    registered_models_count: int
