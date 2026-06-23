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


settings = Settings()
