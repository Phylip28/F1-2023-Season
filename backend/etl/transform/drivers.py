"""Transform raw drivers JSON into normalized drivers and driver_sessions CSVs."""

import csv
from collections import Counter
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client
from etl.transform.utils import normalize_int


def transform_drivers(year: int | None = None) -> tuple[Path, Path]:
    year = year or config.years[0]
    raw = OpenF1Client.load_raw(f"drivers_{year}.json")

    # Build driver_sessions: one row per (session_key, driver_number).
    seen_sessions = set()
    driver_sessions_rows = []
    names_by_driver: dict[int, Counter] = {}

    for item in raw:
        session_key = normalize_int(item.get("_source_session_key"))
        driver_number = normalize_int(item.get("driver_number"))
        if session_key is None or driver_number is None:
            continue

        key = (session_key, driver_number)
        if key in seen_sessions:
            continue
        seen_sessions.add(key)

        full_name = item.get("full_name") or ""
        team_name = item.get("team_name")

        driver_sessions_rows.append(
            {
                "session_key": session_key,
                "driver_number": driver_number,
                "team_name": team_name,
            }
        )

        names_by_driver.setdefault(driver_number, Counter())[full_name] += 1

    # Build drivers roster: one row per driver_number, picking the most common full_name.
    drivers_rows = []
    for driver_number, name_counter in sorted(names_by_driver.items()):
        most_common_name = name_counter.most_common(1)[0][0]
        drivers_rows.append(
            {
                "driver_number": driver_number,
                "full_name": most_common_name or None,
            }
        )

    drivers_path = config.staging_dir / f"drivers_{year}.csv"
    driver_sessions_path = config.staging_dir / f"driver_sessions_{year}.csv"

    with open(drivers_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["driver_number", "full_name"])
        writer.writeheader()
        writer.writerows(drivers_rows)

    with open(driver_sessions_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["session_key", "driver_number", "team_name"])
        writer.writeheader()
        writer.writerows(driver_sessions_rows)

    print(f"Transformed {len(drivers_rows)} drivers to {drivers_path}")
    print(f"Transformed {len(driver_sessions_rows)} driver_sessions to {driver_sessions_path}")
    return drivers_path, driver_sessions_path


if __name__ == "__main__":
    for y in config.years:
        transform_drivers(y)
