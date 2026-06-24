"""Synchronous database utilities for ETL transforms."""

from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

_sync_engine = create_engine(settings.database_url_sync, future=True)
_SyncSessionLocal = sessionmaker(bind=_sync_engine, future=True)


@contextmanager
def get_sync_db():
    """Yield a synchronous SQLAlchemy session."""
    session: Session = _SyncSessionLocal()
    try:
        yield session
    finally:
        session.close()
