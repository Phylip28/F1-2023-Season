import requests


def _normalize_session_result_value(raw_value, session_type):
    if raw_value is None:
        return None

    if isinstance(raw_value, list):
        # Qualifying usually exposes segment values (Q1/Q2/Q3).
        valid_values = [value for value in raw_value if value is not None]
        if not valid_values:
            return None

        if session_type == "Qualifying":
            return valid_values[-1]

        return valid_values[0]

    return raw_value


def _normalize_gap_to_leader(raw_gap, session_type):
    normalized_gap = _normalize_session_result_value(raw_gap, session_type)
    if normalized_gap is None:
        return None

    if isinstance(normalized_gap, str):
        try:
            return float(normalized_gap)
        except ValueError:
            return normalized_gap

    return normalized_gap


def _normalize_duration(raw_duration, session_type):
    normalized_duration = _normalize_session_result_value(raw_duration, session_type)
    if normalized_duration is None:
        return None

    try:
        return float(normalized_duration)
    except (TypeError, ValueError):
        return None


def get_circuit_data(circuit_key):
    url = f"https://api.openf1.org/v1/sessions?year=2023&circuit_key={circuit_key}"
    response = requests.get(url)

    if response.status_code != 200:
        return {"error": "Failed to fetch data."}

    return response.json()


def filter_sessions_by_type(circuit_key, session_type):
    url = f"https://api.openf1.org/v1/sessions?year=2023&circuit_key={circuit_key}&session_type={session_type}"
    response = requests.get(url)

    if response.status_code != 200:
        return {"error": "Failed to fetch data."}

    return response.json()


def get_driver_classification(circuit_key, session_type):
    sessions_url = (
        "https://api.openf1.org/v1/sessions"
        f"?year=2023&circuit_key={circuit_key}&session_type={session_type}"
    )
    sessions_response = requests.get(sessions_url)

    if sessions_response.status_code != 200:
        return {"error": "Failed to fetch session data."}

    sessions = sessions_response.json()
    if not sessions:
        return []

    # Practice sessions can appear multiple times (Practice 1/2/3). We use the latest one.
    selected_session = max(sessions, key=lambda session: session.get("date_start", ""))
    session_key = selected_session.get("session_key")

    classification_url = (
        f"https://api.openf1.org/v1/session_result?session_key={session_key}"
    )
    classification_response = requests.get(classification_url)

    if classification_response.status_code != 200:
        return {"error": "Failed to fetch classification data."}

    classification_rows = classification_response.json()
    if not classification_rows:
        return []

    drivers_url = f"https://api.openf1.org/v1/drivers?session_key={session_key}"
    drivers_response = requests.get(drivers_url)
    driver_lookup = {}

    if drivers_response.status_code == 200:
        drivers = drivers_response.json()
        driver_lookup = {
            driver.get("driver_number"): {
                "driver_name": driver.get("full_name") or driver.get("name_acronym"),
                "team_name": driver.get("team_name"),
            }
            for driver in drivers
        }

    sorted_rows = sorted(
        classification_rows, key=lambda row: row.get("position") or 999
    )
    selected_session_type = selected_session.get("session_type")

    return [
        {
            "position": row.get("position"),
            "driver_number": row.get("driver_number"),
            "driver_name": driver_lookup.get(row.get("driver_number"), {}).get(
                "driver_name"
            ),
            "team_name": driver_lookup.get(row.get("driver_number"), {}).get(
                "team_name"
            ),
            "number_of_laps": row.get("number_of_laps"),
            "duration": _normalize_duration(row.get("duration"), selected_session_type),
            "gap_to_leader": _normalize_gap_to_leader(
                row.get("gap_to_leader"), selected_session_type
            ),
            "dnf": row.get("dnf"),
            "dns": row.get("dns"),
            "dsq": row.get("dsq"),
            "session_key": session_key,
            "session_name": selected_session.get("session_name"),
            "session_type": selected_session_type,
            "circuit_short_name": selected_session.get("circuit_short_name"),
        }
        for row in sorted_rows
        if row.get("driver_number") is not None
    ]


def get_race_weather(circuit_key):
    sessions_url = (
        "https://api.openf1.org/v1/sessions"
        f"?year=2023&circuit_key={circuit_key}&session_type=Race"
    )
    sessions_response = requests.get(sessions_url)

    if sessions_response.status_code != 200:
        return {"error": "Failed to fetch session data."}

    sessions = sessions_response.json()
    if not sessions:
        return []

    selected_session = max(sessions, key=lambda session: session.get("date_start", ""))
    session_key = selected_session.get("session_key")

    weather_url = f"https://api.openf1.org/v1/weather?session_key={session_key}"
    weather_response = requests.get(weather_url)

    if weather_response.status_code != 200:
        return {"error": "Failed to fetch weather data."}

    weather_data = weather_response.json()
    if not weather_data:
        return []

    return weather_data
