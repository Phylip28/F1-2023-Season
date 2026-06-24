from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Circuit(Base):
    __tablename__ = "circuits"

    circuit_key: Mapped[int] = mapped_column(Integer, primary_key=True)
    circuit_short_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)

    sessions: Mapped[list["Session"]] = relationship(
        "Session", back_populates="circuit", cascade="all, delete-orphan"
    )
