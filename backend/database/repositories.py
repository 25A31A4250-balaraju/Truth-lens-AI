"""Repository module for DEEPTRACE-X database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session
from backend.database.models import Analysis, ModelPrediction, EvidenceItem, Region, SystemModel


class AnalysisRepository:
    @staticmethod
    def create(db: Session, analysis: Analysis) -> Analysis:
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis

    @staticmethod
    def get_by_uuid(db: Session, uuid: str) -> Optional[Analysis]:
        return db.query(Analysis).filter(Analysis.uuid == uuid).first()

    @staticmethod
    def get_by_hash(db: Session, file_hash: str) -> Optional[Analysis]:
        return db.query(Analysis).filter(Analysis.file_hash == file_hash).first()

    @staticmethod
    def list_all(db: Session, limit: int = 50, offset: int = 0) -> List[Analysis]:
        return (
            db.query(Analysis)
            .order_by(Analysis.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def delete(db: Session, uuid: str) -> bool:
        analysis = db.query(Analysis).filter(Analysis.uuid == uuid).first()
        if not analysis:
            return False
        db.delete(analysis)
        db.commit()
        return True


class ModelRepository:
    @staticmethod
    def upsert_system_model(
        db: Session,
        name: str,
        version: str,
        status: str,
        checkpoint_path: Optional[str] = None,
        device: str = "cpu",
        description: Optional[str] = None
    ) -> SystemModel:
        model = db.query(SystemModel).filter(SystemModel.name == name).first()
        if not model:
            model = SystemModel(
                name=name,
                version=version,
                status=status,
                checkpoint_path=checkpoint_path,
                device=device,
                description=description
            )
            db.add(model)
        else:
            model.version = version
            model.status = status
            model.checkpoint_path = checkpoint_path
            model.device = device
            model.description = description
        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def list_all(db: Session) -> List[SystemModel]:
        return db.query(SystemModel).all()
