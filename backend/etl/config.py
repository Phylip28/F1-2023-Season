import os
from pathlib import Path


class ETLConfig:
    def __init__(self):
        self.openf1_base_url = os.getenv(
            "OPENF1_BASE_URL",
            "https://api.openf1.org/v1",
        )
        self.years = [int(y) for y in os.getenv("ETL_YEARS", "2023").split(",")]
        self.request_delay_seconds = float(os.getenv("ETL_REQUEST_DELAY", "0.5"))
        self.request_timeout_seconds = float(os.getenv("ETL_REQUEST_TIMEOUT", "30"))
        self.max_retries = int(os.getenv("ETL_MAX_RETRIES", "3"))

        project_root = Path(__file__).resolve().parent
        self.raw_dir = Path(os.getenv("ETL_RAW_DIR", str(project_root / "raw")))
        self.staging_dir = Path(os.getenv("ETL_STAGING_DIR", str(project_root / "staging")))

        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.staging_dir.mkdir(parents=True, exist_ok=True)


config = ETLConfig()
