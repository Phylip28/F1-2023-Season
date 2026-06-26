"""Extract lap timing data from OpenF1 API for race sessions."""

from etl.config import config
from etl.extract.client import OpenF1Client


def extract_laps(year: int | None = None) -> list[dict]:
    year = year or config.years[0]
    client = OpenF1Client()
    sessions = client.load_raw(f"sessions_{year}.json")
    race_session_keys = [
        s["session_key"]
        for s in sessions
        if s.get("session_type", "").lower() == "race" and "session_key" in s
    ]

    output_file = f"laps_{year}.json"
    try:
        all_laps = client.load_raw(output_file)
    except FileNotFoundError:
        all_laps = []

    fetched_keys = {
        lap.get("_source_session_key")
        for lap in all_laps
        if "_source_session_key" in lap
    }

    for session_key in race_session_keys:
        if session_key in fetched_keys:
            continue
        laps = client.get("laps", params={"session_key": session_key})
        for lap in laps:
            lap["_source_session_key"] = session_key
        all_laps.extend(laps)
        client.save_raw(output_file, all_laps)

    print(f"Extracted {len(all_laps)} lap records for year {year}")
    return all_laps


if __name__ == "__main__":
    for y in config.years:
        extract_laps(y)
