"""Transform raw weather JSON into normalized CSV."""

import csv
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client
from etl.transform.utils import normalize_datetime, normalize_float, normalize_int


def transform_weather(year: int | None = None) -> Path:
    year = year or config.years[0]
    raw = OpenF1Client.load_raw(f"weather_{year}.json")

    rows = []
    for item in raw:
        rows.append(
            {
                "session_key": normalize_int(item.get("_source_session_key")),
                "date": normalize_datetime(item.get("date")),
                "air_temperature": normalize_float(item.get("air_temperature")),
                "track_temperature": normalize_float(item.get("track_temperature")),
                "humidity": normalize_float(item.get("humidity")),
                "pressure": normalize_float(item.get("pressure")),
                "wind_speed": normalize_float(item.get("wind_speed")),
                "wind_direction": normalize_int(item.get("wind_direction")),
                "rainfall": normalize_float(item.get("rainfall")),
            }
        )

    output_path = config.staging_dir / f"weather_{year}.csv"
    fieldnames = [
        "session_key",
        "date",
        "air_temperature",
        "track_temperature",
        "humidity",
        "pressure",
        "wind_speed",
        "wind_direction",
        "rainfall",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Transformed {len(rows)} weather records to {output_path}")
    return output_path


if __name__ == "__main__":
    for y in config.years:
        transform_weather(y)
