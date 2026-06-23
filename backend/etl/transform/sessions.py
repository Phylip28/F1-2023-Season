"""Transform raw sessions JSON into normalized CSV."""

import csv
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client
from etl.transform.utils import normalize_datetime, normalize_int


def transform_sessions(year: int | None = None) -> Path:
    year = year or config.years[0]
    raw = OpenF1Client.load_raw(f"sessions_{year}.json")

    rows = []
    for item in raw:
        rows.append(
            {
                "session_key": normalize_int(item.get("session_key")),
                "session_type": item.get("session_type"),
                "session_name": item.get("session_name"),
                "date_start": normalize_datetime(item.get("date_start")),
                "date_end": normalize_datetime(item.get("date_end")),
                "year": normalize_int(item.get("year")),
                "circuit_key": normalize_int(item.get("circuit_key")),
                "meeting_key": normalize_int(item.get("meeting_key")),
            }
        )

    output_path = config.staging_dir / f"sessions_{year}.csv"
    fieldnames = [
        "session_key",
        "session_type",
        "session_name",
        "date_start",
        "date_end",
        "year",
        "circuit_key",
        "meeting_key",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Transformed {len(rows)} sessions to {output_path}")
    return output_path


if __name__ == "__main__":
    for y in config.years:
        transform_sessions(y)
