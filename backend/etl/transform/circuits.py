"""Transform raw sessions JSON into a deduplicated circuits CSV."""

import csv
from pathlib import Path

from etl.config import config
from etl.extract.client import OpenF1Client
from etl.transform.utils import normalize_int


def transform_circuits(year: int | None = None) -> Path:
    year = year or config.years[0]
    raw = OpenF1Client.load_raw(f"sessions_{year}.json")

    circuits = {}
    for item in raw:
        circuit_key = normalize_int(item.get("circuit_key"))
        if circuit_key is None:
            continue
        if circuit_key not in circuits:
            circuits[circuit_key] = {
                "circuit_key": circuit_key,
                "circuit_short_name": item.get("circuit_short_name"),
                "country_name": item.get("country_name"),
                "location": item.get("location"),
            }

    rows = sorted(circuits.values(), key=lambda c: c["circuit_key"])
    output_path = config.staging_dir / f"circuits_{year}.csv"
    fieldnames = ["circuit_key", "circuit_short_name", "country_name", "location"]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Transformed {len(rows)} circuits to {output_path}")
    return output_path


if __name__ == "__main__":
    for y in config.years:
        transform_circuits(y)
