import os


class Settings:
    def __init__(self):
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://f1_user:f1_password@postgres:5432/f1_db",
        )
        self.database_url_sync = os.getenv(
            "DATABASE_URL_SYNC",
            "postgresql+psycopg2://f1_user:f1_password@postgres:5432/f1_db",
        )
        self.cache_ttl_seconds = int(os.getenv("CACHE_TTL_SECONDS", "60"))
        self.cache_enabled = os.getenv("CACHE_ENABLED", "true").lower() in (
            "true",
            "1",
            "yes",
        )
        self.redis_url = os.getenv("REDIS_URL")


settings = Settings()
