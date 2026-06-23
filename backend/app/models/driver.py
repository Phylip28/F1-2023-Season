from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Driver(Base):
    __tablename__ = "drivers"

    driver_number: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    driver_sessions: Mapped[list["DriverSession"]] = relationship(
        "DriverSession", back_populates="driver", cascade="all, delete-orphan"
    )
