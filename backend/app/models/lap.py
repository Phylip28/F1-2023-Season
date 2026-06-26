from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Lap(Base):
    __tablename__ = "laps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessions.session_key"), nullable=False, index=True
    )
    driver_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    lap_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    date_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lap_duration: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_sector_1: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_sector_2: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_sector_3: Mapped[float | None] = mapped_column(Float, nullable=True)
    i1_speed: Mapped[int | None] = mapped_column(Integer, nullable=True)
    i2_speed: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_pit_out_lap: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    session: Mapped["Session"] = relationship("Session", back_populates="laps")
