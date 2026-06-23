"""Transform raw drivers JSON into normalized CSV."""

import csv
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client
from etl.transform.utils import normalize_int


def transform_drivers(year: int | None = None) -> Path:
    year = year or config.years[0]
    raw = OpenF1Client.load_raw(f"drivers_{year}.json")

    seen = set()
    rows = []
    for item in raw:
        session_key = normalize_int(item.get("_source_session_key"))
        driver_number = normalize_int(item.get("driver_number"))
        key = (session_key, driver_number)
        if key in seen or session_key is None or driver_number is None:
            continue
        seen.add(key)
        rows.append(
            {
                "session_key": session_key,
                "driver_number": driver_number,
                "full_name": item.get("full_name"),
                "team_name": item.get("team_name"),
            }
        )

    output_path = config.staging_dir / f"drivers_{year}.csv"
    fieldnames = ["session_key", "driver_number", "full_name", "team_name"]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Transformed {len(rows)} driver records to {output_path}")
    return output_path


if __name__ == "__main__":
    for y in config.years:
        transform_drivers(y)
