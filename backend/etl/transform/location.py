"""Transform raw location JSONL into CSV for loading."""

import csv
import json
from pathlib import Path

from etl.config import config
from etl.transform.utils import normalize_datetime, normalize_float, normalize_int


def transform_location(year: int | None = None) -> Path:
    year = year or config.years[0]
    raw_path = config.raw_dir / f"location_{year}.jsonl"

    rows = []
    with open(raw_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            x = normalize_float(item.get("x"))
            y = normalize_float(item.get("y"))
            # Skip records where the car is at the origin (usually before the session starts).
            if x is None or y is None or (x == 0 and y == 0):
                continue
            rows.append(
                {
                    "session_key": normalize_int(item.get("_source_session_key")),
                    "driver_number": normalize_int(item.get("_source_driver_number")),
                    "date": normalize_datetime(item.get("date")),
                    "x": x,
                    "y": y,
                    "z": normalize_float(item.get("z")),
                }
            )

    output_path = config.staging_dir / f"location_{year}.csv"
    fieldnames = ["session_key", "driver_number", "date", "x", "y", "z"]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Transformed {len(rows)} location records to {output_path}")
    return output_path


if __name__ == "__main__":
    for y in config.years:
        transform_location(y)
