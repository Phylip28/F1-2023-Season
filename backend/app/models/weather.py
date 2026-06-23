from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Weather(Base):
    __tablename__ = "weather"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_key: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessions.session_key"), nullable=False, index=True
    )
    date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    air_temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    track_temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_direction: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rainfall: Mapped[float | None] = mapped_column(Float, nullable=True)

    session: Mapped["Session"] = relationship("Session", back_populates="weather_readings")
