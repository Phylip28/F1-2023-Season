from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DriverSession(Base):
    __tablename__ = "driver_sessions"

    session_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessions.session_key"), primary_key=True
    )
    driver_number: Mapped[int] = mapped_column(
        Integer, ForeignKey("drivers.driver_number"), primary_key=True
    )
    team_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    session: Mapped["Session"] = relationship("Session", back_populates="driver_sessions")
    driver: Mapped["Driver"] = relationship("Driver", back_populates="driver_sessions")
