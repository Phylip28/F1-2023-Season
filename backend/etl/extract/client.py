import json
import time
from pathlib import Path

import requests

from etl.config import config


class OpenF1Client:
    def __init__(self):
        self.base_url = config.openf1_base_url.rstrip("/")
        self.timeout = config.request_timeout_seconds
        self.delay = config.request_delay_seconds
        self.max_retries = config.max_retries

    def get(self, endpoint: str, params: dict | None = None) -> list[dict]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        last_exception = None

        for attempt in range(1, self.max_retries + 1):
            try:
                response = requests.get(url, params=params, timeout=self.timeout)
                if response.status_code == 429:
                    wait = self.delay * (2 ** attempt)
                    print(f"Rate limited on {url}, waiting {wait}s before retry {attempt}/{self.max_retries}")
                    time.sleep(wait)
                    continue
                if response.status_code == 404:
                    print(f"No data found for {url}, returning empty list")
                    time.sleep(self.delay)
                    return []
                response.raise_for_status()
                data = response.json()
                if not isinstance(data, list):
                    raise ValueError(f"Expected list from {url}, got {type(data).__name__}")
                time.sleep(self.delay)
                return data
            except (requests.RequestException, ValueError) as exc:
                last_exception = exc
                if attempt < self.max_retries:
                    time.sleep(self.delay * attempt)

        raise RuntimeError(f"Failed to fetch {url} after {self.max_retries} attempts: {last_exception}")

    @staticmethod
    def save_raw(filename: str, data: list[dict]) -> Path:
        path = config.raw_dir / filename
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return path

    @staticmethod
    def load_raw(filename: str) -> list[dict]:
        path = config.raw_dir / filename
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
