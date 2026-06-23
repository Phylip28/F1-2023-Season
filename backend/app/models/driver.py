from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Driver(Base):
    __tablename__ = "drivers"

    session_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessions.session_key"), primary_key=True
    )
    driver_number: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    team_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    session: Mapped["Session"] = relationship("Session", back_populates="drivers")
