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