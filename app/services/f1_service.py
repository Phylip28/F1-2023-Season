import requests

def get_2023_season_data():
    url = "https://api.openf1.org/v1/sessions?year=2023"
    response = requests.get(url)

    if (response.status_code != 200):
        return {"error": "Failed to fetch data."}
    
    return response.json()

def filter_sessions_by_type(circuit_key, session_type):
    url = f"https://api.openf1.org/v1/sessions?year=2023&circuit_key={circuit_key}&session_type={session_type}"
    response = requests.get(url)

    if (response.status_code != 200):
        return {"error": "Failed to fetch data."}
    
    return response.json()
