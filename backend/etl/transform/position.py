"""Transform raw race position JSON into CSV for loading."""

import csv
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client
from etl.transform.utils import normalize_datetime, normalize_int


def transform_position(year: int | None = None) -> Path:
    year = year or config.years[0]
    raw = OpenF1Client.load_raw(f"position_{year}.json")

    rows = []
    for item in raw:
        rows.append(
            {
                "session_key": normalize_int(item.get("_source_session_key")),
                "driver_number": normalize_int(item.get("driver_number")),
                "position": normalize_int(item.get("position")),
                "date": normalize_datetime(item.get("date")),
            }
        )

    output_path = config.staging_dir / f"position_{year}.csv"
    fieldnames = ["session_key", "driver_number", "position", "date"]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Transformed {len(rows)} position records to {output_path}")
    return output_path


if __name__ == "__main__":
    for y in config.years:
        transform_position(y)
