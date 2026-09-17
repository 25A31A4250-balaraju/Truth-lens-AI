"""Database connection and session management for DEEPTRACE-X.

Initializes SQLite engine with foreign key enforcement and provides
session lifecycle utilities.
"""

from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.config import settings

# SQLite requires explicit PRAGMA foreign_keys = ON
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing transactional database sessions to endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Creates all database tables based on declarative models and applies column migrations."""
    settings.ensure_directories()
    Base.metadata.create_all(bind=engine)

    # Lightweight SQLite schema migration
    with engine.connect() as conn:
        cursor = conn.connection.cursor()
        cursor.execute("PRAGMA table_info(analyses)")
        columns = [row[1] for row in cursor.fetchall()]
        if "fft_path" not in columns:
            cursor.execute("ALTER TABLE analyses ADD COLUMN fft_path VARCHAR(512)")
            conn.connection.commit()
        cursor.close()
