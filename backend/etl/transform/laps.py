"""Transform raw lap JSON into CSV for loading."""

import csv
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client
from etl.transform.utils import (
    normalize_bool,
    normalize_datetime,
    normalize_float,
    normalize_int,
)


def transform_laps(year: int | None = None) -> Path:
    year = year or config.years[0]
    raw = OpenF1Client.load_raw(f"laps_{year}.json")

    rows = []
    for item in raw:
        rows.append(
            {
                "session_key": normalize_int(item.get("_source_session_key")),
                "driver_number": normalize_int(item.get("driver_number")),
                "lap_number": normalize_int(item.get("lap_number")),
                "date_start": normalize_datetime(item.get("date_start")),
                "lap_duration": normalize_float(item.get("lap_duration")),
                "duration_sector_1": normalize_float(item.get("duration_sector_1")),
                "duration_sector_2": normalize_float(item.get("duration_sector_2")),
                "duration_sector_3": normalize_float(item.get("duration_sector_3")),
                "i1_speed": normalize_int(item.get("i1_speed")),
                "i2_speed": normalize_int(item.get("i2_speed")),
                "is_pit_out_lap": normalize_bool(item.get("is_pit_out_lap")),
            }
        )

    output_path = config.staging_dir / f"laps_{year}.csv"
    fieldnames = [
        "session_key",
        "driver_number",
        "lap_number",
        "date_start",
        "lap_duration",
        "duration_sector_1",
        "duration_sector_2",
        "duration_sector_3",
        "i1_speed",
        "i2_speed",
        "is_pit_out_lap",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Transformed {len(rows)} lap records to {output_path}")
    return output_path


if __name__ == "__main__":
    for y in config.years:
        transform_laps(y)
