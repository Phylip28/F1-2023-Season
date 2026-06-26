from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessions.session_key"), nullable=False, index=True
    )
    driver_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    x: Mapped[float | None] = mapped_column(Float, nullable=True)
    y: Mapped[float | None] = mapped_column(Float, nullable=True)
    z: Mapped[float | None] = mapped_column(Float, nullable=True)

    session: Mapped["Session"] = relationship("Session", back_populates="locations")
