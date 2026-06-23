from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Session(Base):
    __tablename__ = "sessions"

    session_key: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_type: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    session_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    date_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    date_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    circuit_key: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("circuits.circuit_key"), nullable=True, index=True
    )
    circuit_short_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    meeting_key: Mapped[int | None] = mapped_column(Integer, nullable=True)

    circuit: Mapped["Circuit"] = relationship("Circuit", back_populates="sessions")
    drivers: Mapped[list["Driver"]] = relationship(
        "Driver", back_populates="session", cascade="all, delete-orphan"
    )
    results: Mapped[list["SessionResult"]] = relationship(
        "SessionResult", back_populates="session", cascade="all, delete-orphan"
    )
    weather_readings: Mapped[list["Weather"]] = relationship(
        "Weather", back_populates="session", cascade="all, delete-orphan"
    )
