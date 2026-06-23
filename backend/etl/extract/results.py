"""Extract session results from OpenF1 API for each session."""

from etl.config import config
from etl.extract.client import OpenF1Client


def extract_results(year: int | None = None) -> list[dict]:
    year = year or config.years[0]
    client = OpenF1Client()
    sessions = client.load_raw(f"sessions_{year}.json")
    session_info = {s["session_key"]: s for s in sessions if "session_key" in s}

    output_file = f"results_{year}.json"
    try:
        all_results = client.load_raw(output_file)
    except FileNotFoundError:
        all_results = []

    fetched_keys = {
        r.get("_source_session_key") for r in all_results if "_source_session_key" in r
    }

    for session_key, session in session_info.items():
        if session_key in fetched_keys:
            continue
        results = client.get("session_result", params={"session_key": session_key})
        for result in results:
            result["_source_session_key"] = session_key
            result["_source_session_type"] = session.get("session_type")
        all_results.extend(results)
        client.save_raw(output_file, all_results)

    print(f"Extracted {len(all_results)} result records for year {year}")
    return all_results


if __name__ == "__main__":
    for y in config.years:
        extract_results(y)
