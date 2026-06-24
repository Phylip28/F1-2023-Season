"""Extract sessions from OpenF1 API for configured years."""

from etl.config import config
from etl.extract.client import OpenF1Client


def extract_sessions(year: int | None = None) -> list[dict]:
    year = year or config.years[0]
    client = OpenF1Client()
    sessions = client.get("sessions", params={"year": year})
    client.save_raw(f"sessions_{year}.json", sessions)
    print(f"Extracted {len(sessions)} sessions for year {year}")
    return sessions


if __name__ == "__main__":
    for y in config.years:
        extract_sessions(y)
