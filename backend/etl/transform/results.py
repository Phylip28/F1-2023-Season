"""Transform raw session results JSON into normalized CSV."""

import csv
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client
from etl.transform.utils import normalize_bool, normalize_float, normalize_int, normalize_gap


def transform_results(year: int | None = None) -> Path:
    year = year or config.years[0]
    raw = OpenF1Client.load_raw(f"results_{year}.json")

    seen = set()
    rows = []
    for item in raw:
        session_key = normalize_int(item.get("_source_session_key"))
        driver_number = normalize_int(item.get("driver_number"))
        key = (session_key, driver_number)
        if key in seen or session_key is None or driver_number is None:
            continue
        seen.add(key)

        session_type = item.get("_source_session_type", "")
        gap_numeric, gap_raw = normalize_gap(item.get("gap_to_leader"), session_type)

        rows.append(
            {
                "session_key": session_key,
                "driver_number": driver_number,
                "position": normalize_int(item.get("position")),
                "number_of_laps": normalize_int(item.get("number_of_laps")),
                "duration": normalize_float(item.get("duration")),
                "gap_to_leader": gap_numeric,
                "gap_to_leader_raw": gap_raw,
                "dnf": normalize_bool(item.get("dnf")),
                "dns": normalize_bool(item.get("dns")),
                "dsq": normalize_bool(item.get("dsq")),
            }
        )

    output_path = config.staging_dir / f"results_{year}.csv"
    fieldnames = [
        "session_key",
        "driver_number",
        "position",
        "number_of_laps",
        "duration",
        "gap_to_leader",
        "gap_to_leader_raw",
        "dnf",
        "dns",
        "dsq",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Transformed {len(rows)} result records to {output_path}")
    return output_path


if __name__ == "__main__":
    for y in config.years:
        transform_results(y)
