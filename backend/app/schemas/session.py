from pydantic import BaseModel
from datetime import datetime


class SessionSchema(BaseModel):
    session_type: str
    session_name: str
    date_start: datetime
    date_end: datetime
    circuit_short_name: str
    country_name: str
    location: str


class SessionFilterSchema(BaseModel):
    circuit_key: int
    session_type: str


class DriverClassificationSchema(BaseModel):
    position: int | None = None
    driver_number: int
    driver_name: str | None = None
    team_name: str | None = None
    number_of_laps: int | None = None
    gap_to_leader: float | None = None
    dnf: bool | None = None
    dns: bool | None = None
    dsq: bool | None = None
    session_key: int
    session_name: str
    session_type: str
    circuit_short_name: str
