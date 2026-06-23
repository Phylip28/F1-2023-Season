"""Load transformed CSV files into PostgreSQL using COPY."""

import csv
from pathlib import Path

import psycopg2

from app.core.config import settings
from etl.config import config


TABLE_LOAD_ORDER = [
    "circuits",
    "sessions",
    "drivers",
    "session_results",
    "weather",
]

CSV_TO_TABLE = {
    "circuits": "circuits",
    "sessions": "sessions",
    "drivers": "drivers",
    "results": "session_results",
    "weather": "weather",
}


def _get_csv_files(year: int):
    files = {}
    for prefix in CSV_TO_TABLE.keys():
        path = config.staging_dir / f"{prefix}_{year}.csv"
        if path.exists():
            files[CSV_TO_TABLE[prefix]] = path
    return files


def _truncate_tables(cursor):
    for table in TABLE_LOAD_ORDER:
        cursor.execute(f"TRUNCATE TABLE {table} CASCADE")
        print(f"Truncated {table}")


def _copy_table(cursor, table_name: str, csv_path: Path):
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        headers = next(reader)
        columns = ", ".join(headers)

        # Use psycopg2 copy_expert with COPY ... FROM STDIN CSV HEADER
        copy_sql = f"COPY {table_name} ({columns}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)"
        cursor.copy_expert(sql=copy_sql, file=f)
    print(f"Loaded {csv_path} into {table_name}")


def load_year(year: int | None = None):
    year = year or config.years[0]
    csv_files = _get_csv_files(year)

    conn = psycopg2.connect(settings.database_url_sync.replace("postgresql+psycopg2://", "postgresql://"))
    conn.autocommit = False
    cursor = conn.cursor()

    try:
        _truncate_tables(cursor)
        for table in TABLE_LOAD_ORDER:
            if table in csv_files:
                _copy_table(cursor, table, csv_files[table])
        conn.commit()
        print(f"Successfully loaded year {year}")
    except Exception as exc:
        conn.rollback()
        raise RuntimeError(f"Failed to load year {year}: {exc}") from exc
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    for y in config.years:
        load_year(y)
