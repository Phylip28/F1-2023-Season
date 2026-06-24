from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class RacePosition(Base):
    __tablename__ = "race_positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessions.session_key"), nullable=False, index=True
    )
    driver_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    session: Mapped["Session"] = relationship("Session", back_populates="race_positions")
