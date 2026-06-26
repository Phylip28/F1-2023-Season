"""Extract car location (x, y) telemetry from OpenF1 API for race sessions.

Stores raw output as newline-delimited JSON (JSONL) so new records can be
appended without rewriting the entire file on every driver.
"""

import json
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client


def _driver_numbers_for_session(client: OpenF1Client, session_key: int) -> set[int]:
    """Return driver numbers that recorded results for a session."""
    try:
        results = client.get("session_result", params={"session_key": session_key})
    except RuntimeError:
        return set()
    return {r["driver_number"] for r in results if "driver_number" in r}


def _fetched_pairs(jsonl_path: Path) -> set[tuple[int, int]]:
    """Return (session_key, driver_number) pairs already stored in JSONL."""
    pairs: set[tuple[int, int]] = set()
    if not jsonl_path.exists():
        return pairs
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            session_key = record.get("_source_session_key")
            driver_number = record.get("_source_driver_number")
            if session_key is not None and driver_number is not None:
                pairs.add((session_key, driver_number))
    return pairs


def extract_location(year: int | None = None) -> list[dict]:
    year = year or config.years[0]
    client = OpenF1Client()
    sessions = client.load_raw(f"sessions_{year}.json")
    race_sessions = [
        s
        for s in sessions
        if s.get("session_type", "").lower() == "race" and "session_key" in s
    ]

    output_path = config.raw_dir / f"location_{year}.jsonl"
    fetched_pairs = _fetched_pairs(output_path)
    total_records = 0

    with open(output_path, "a", encoding="utf-8") as out:
        for session in race_sessions:
            session_key = session["session_key"]
            driver_numbers = _driver_numbers_for_session(client, session_key)
            if not driver_numbers:
                print(f"No results found for session {session_key}, skipping location")
                continue

            for driver_number in sorted(driver_numbers):
                if (session_key, driver_number) in fetched_pairs:
                    continue
                locations = client.get(
                    "location",
                    params={"session_key": session_key, "driver_number": driver_number},
                )
                for loc in locations:
                    loc["_source_session_key"] = session_key
                    loc["_source_driver_number"] = driver_number
                    out.write(json.dumps(loc, ensure_ascii=False) + "\n")
                total_records += len(locations)
                if total_records % 50000 == 0 and total_records > 0:
                    print(f"  ... appended {total_records:,} location records this run")

    print(f"Extracted/updated {output_path}")
    return []


if __name__ == "__main__":
    for y in config.years:
        extract_location(y)
