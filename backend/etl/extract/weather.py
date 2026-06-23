"""Extract weather readings from OpenF1 API for race sessions."""

from etl.config import config
from etl.extract.client import OpenF1Client


def extract_weather(year: int | None = None) -> list[dict]:
    year = year or config.years[0]
    client = OpenF1Client()
    sessions = client.load_raw(f"sessions_{year}.json")
    race_session_keys = [
        s["session_key"]
        for s in sessions
        if s.get("session_type", "").lower() == "race" and "session_key" in s
    ]

    output_file = f"weather_{year}.json"
    try:
        all_weather = client.load_raw(output_file)
    except FileNotFoundError:
        all_weather = []

    fetched_keys = {
        w.get("_source_session_key") for w in all_weather if "_source_session_key" in w
    }

    for session_key in race_session_keys:
        if session_key in fetched_keys:
            continue
        readings = client.get("weather", params={"session_key": session_key})
        for reading in readings:
            reading["_source_session_key"] = session_key
        all_weather.extend(readings)
        client.save_raw(output_file, all_weather)

    print(f"Extracted {len(all_weather)} weather records for year {year}")
    return all_weather


if __name__ == "__main__":
    for y in config.years:
        extract_weather(y)
