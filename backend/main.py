"""Main application entrypoint for DEEPTRACE-X backend."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database.database import init_db
from backend.api.routes_health import router as health_router
from backend.api.routes_models import router as models_router
from backend.api.routes_analysis import router as analysis_router
from backend.utils.logging_utils import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle handler."""
    logger.info("Initializing DEEPTRACE-X database and filesystem storage...")
    init_db()
    logger.info("DEEPTRACE-X backend initialized successfully.")
    yield
    logger.info("Shutting down DEEPTRACE-X backend...")


app = FastAPI(
    title="DEEPTRACE-X API",
    description="Adaptive Multi-Signal AI Image Forensics Platform API",
    version="1.0.0-alpha",
    lifespan=lifespan
)

# CORS Configuration — split exact origins from wildcard patterns
import re as _re

_raw_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
_exact_origins = [o for o in _raw_origins if "*" not in o]
# Convert glob-style wildcards (e.g. https://*.netlify.app) to regex
_wildcard_patterns = [
    _re.escape(o).replace(r"\*", r"[^.]+") for o in _raw_origins if "*" in o
]
_origin_regex = "|".join(_wildcard_patterns) if _wildcard_patterns else None

app.add_middleware(
    CORSMiddleware,
    allow_origins=_exact_origins if _exact_origins else ["*"],
    allow_origin_regex=_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for image preview and FFT visualizations
settings.ensure_directories()
app.mount("/static/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")
app.mount("/static/analyses", StaticFiles(directory=str(settings.ANALYSES_DIR)), name="analyses")

# Include Routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(models_router, prefix="/api/v1")
app.include_router(analysis_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "platform": "DEEPTRACE-X",
        "description": "Adaptive Multi-Signal AI Image Forensics Platform",
        "status": "online",
        "device": f"{settings.DEFAULT_DEVICE} (CPU Mode)",
        "docs_url": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
