"""Extract drivers from OpenF1 API for each session."""

from etl.config import config
from etl.extract.client import OpenF1Client


def extract_drivers(year: int | None = None) -> list[dict]:
    year = year or config.years[0]
    client = OpenF1Client()
    sessions = client.load_raw(f"sessions_{year}.json")
    session_keys = [s["session_key"] for s in sessions if "session_key" in s]

    output_file = f"drivers_{year}.json"
    try:
        all_drivers = client.load_raw(output_file)
    except FileNotFoundError:
        all_drivers = []

    fetched_keys = {
        d.get("_source_session_key") for d in all_drivers if "_source_session_key" in d
    }

    for session_key in session_keys:
        if session_key in fetched_keys:
            continue
        drivers = client.get("drivers", params={"session_key": session_key})
        for driver in drivers:
            driver["_source_session_key"] = session_key
        all_drivers.extend(drivers)
        client.save_raw(output_file, all_drivers)

    print(f"Extracted {len(all_drivers)} driver records for year {year}")
    return all_drivers


if __name__ == "__main__":
    for y in config.years:
        extract_drivers(y)
