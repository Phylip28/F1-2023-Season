from sqlalchemy import Boolean, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class SessionResult(Base):
    __tablename__ = "session_results"

    session_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessions.session_key"), primary_key=True
    )
    driver_number: Mapped[int] = mapped_column(Integer, primary_key=True)
    position: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    number_of_laps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration: Mapped[float | None] = mapped_column(Float, nullable=True)
    gap_to_leader: Mapped[float | None] = mapped_column(Float, nullable=True)
    gap_to_leader_raw: Mapped[str | None] = mapped_column(
        "gap_to_leader_raw", String(50), nullable=True
    )
    dnf: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    dns: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    dsq: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    session: Mapped["Session"] = relationship("Session", back_populates="results")
