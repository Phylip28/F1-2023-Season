"""Extract race position changes from OpenF1 API for race sessions."""

from etl.config import config
from etl.extract.client import OpenF1Client


def extract_position(year: int | None = None) -> list[dict]:
    year = year or config.years[0]
    client = OpenF1Client()
    sessions = client.load_raw(f"sessions_{year}.json")
    race_session_keys = [
        s["session_key"]
        for s in sessions
        if s.get("session_type", "").lower() == "race" and "session_key" in s
    ]

    output_file = f"position_{year}.json"
    try:
        all_positions = client.load_raw(output_file)
    except FileNotFoundError:
        all_positions = []

    fetched_keys = {
        p.get("_source_session_key")
        for p in all_positions
        if "_source_session_key" in p
    }

    for session_key in race_session_keys:
        if session_key in fetched_keys:
            continue
        positions = client.get("position", params={"session_key": session_key})
        for position in positions:
            position["_source_session_key"] = session_key
        all_positions.extend(positions)
        client.save_raw(output_file, all_positions)

    print(f"Extracted {len(all_positions)} position records for year {year}")
    return all_positions


if __name__ == "__main__":
    for y in config.years:
        extract_position(y)
