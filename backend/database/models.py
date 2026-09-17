"""SQLAlchemy ORM models for DEEPTRACE-X forensic data persistence."""

import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from backend.database.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    stored_path = Column(String(512), nullable=False)
    file_hash = Column(String(64), index=True, nullable=False)  # SHA-256
    media_type = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)

    # Forensic Outcomes
    overall_verdict = Column(String(64), nullable=False)  # LIKELY_AUTHENTIC, LIKELY_MANIPULATED, UNCERTAIN, SUSPECTED_OOD
    overall_score = Column(Float, nullable=False)          # Calibrated probability (0.0 to 1.0)
    uncertainty_score = Column(Float, nullable=False)      # 0.0 (certain) to 1.0 (highly uncertain)
    uncertainty_label = Column(String(32), nullable=False) # LOW, MODERATE, HIGH
    image_quality_score = Column(Float, nullable=True)    # 0.0 to 1.0
    image_quality_label = Column(String(32), nullable=True) # GOOD, MODERATE, POOR
    face_count = Column(Integer, default=0, nullable=False)
    processing_time_ms = Column(Float, nullable=False)
    analysis_mode = Column(String(32), default="standard")  # quick vs full
    fft_path = Column(String(512), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True, nullable=False)

    # Relationships
    model_predictions = relationship("ModelPrediction", back_populates="analysis", cascade="all, delete-orphan")
    evidence_items = relationship("EvidenceItem", back_populates="analysis", cascade="all, delete-orphan")
    regions = relationship("Region", back_populates="analysis", cascade="all, delete-orphan")
    embeddings = relationship("ForensicEmbedding", back_populates="analysis", cascade="all, delete-orphan")
    robustness_tests = relationship("RobustnessTest", back_populates="analysis", cascade="all, delete-orphan")


class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    model_name = Column(String(64), index=True, nullable=False)  # Effort, LSDA, F3Net, SBI, Xception, DINOv2
    model_version = Column(String(32), nullable=False)
    prediction = Column(String(32), nullable=False)              # FAKE, REAL, UNCERTAIN, N/A
    confidence = Column(Float, nullable=False)                   # 0.0 to 1.0
    processing_time_ms = Column(Float, nullable=False)
    status = Column(String(32), nullable=False)                  # COMPLETED, SKIPPED, FAILED
    error_message = Column(Text, nullable=True)

    analysis = relationship("Analysis", back_populates="model_predictions")


class EvidenceItem(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    evidence_type = Column(String(64), nullable=False)           # SPATIAL, FREQUENCY, SEMANTIC, CONSENSUS
    score = Column(Float, nullable=False)                        # Anomaly/Forensic score (0.0 to 1.0)
    description = Column(Text, nullable=False)
    source_model = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    analysis = relationship("Analysis", back_populates="evidence_items")


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    region_score = Column(Float, nullable=False)                 # Suspicion/anomaly score
    region_type = Column(String(32), nullable=False)             # FACE, SUSPICIOUS_PATCH, FREQUENCY_ARTIFACT

    analysis = relationship("Analysis", back_populates="regions")


class ForensicEmbedding(Base):
    __tablename__ = "forensic_embeddings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    embedding_path = Column(String(512), nullable=False)         # Path to stored .npy vector
    embedding_dimension = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    analysis = relationship("Analysis", back_populates="embeddings")


class RobustnessTest(Base):
    __tablename__ = "robustness_tests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    transformation = Column(String(64), nullable=False)          # JPEG_COMPRESSION, GAUSSIAN_BLUR, RESIZE
    parameter = Column(String(64), nullable=False)               # e.g., "quality=70", "sigma=1.5"
    prediction = Column(String(32), nullable=False)
    score_delta = Column(Float, nullable=False)
    uncertainty_delta = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    analysis = relationship("Analysis", back_populates="robustness_tests")


class SystemModel(Base):
    __tablename__ = "system_models"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(64), unique=True, index=True, nullable=False)
    version = Column(String(32), nullable=False)
    checkpoint_path = Column(String(512), nullable=True)
    status = Column(String(32), nullable=False)                  # READY, STANDBY_NO_CHECKPOINT, DISABLED
    device = Column(String(32), default="cpu", nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
