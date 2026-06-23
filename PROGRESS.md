# Progress Log

## Current Verified State

- Repository root: `/home/phylip/Downloads/F1-2023-Season`
- Standard startup path: `./init.sh` ✓
- Standard verification path: AGENTS.md Section 3 ✓
- Current highest-priority unfinished feature: Refactor backend services to query PostgreSQL (Phase 3)
- Current blocker: None

## Session Log

### Session 001

- Date: 2026-06-22
- Goal: Implement Phases 0 and 1 — PostgreSQL infrastructure and SQLAlchemy schema.
- Completed:
  - Added PostgreSQL 16 service to `docker-compose.yaml` with healthcheck and persistent volume.
  - Migrated backend Dockerfile from pip/requirements.txt to `uv` using `pyproject.toml`/`uv.lock`.
  - Added `container_name` to backend and frontend services so AGENTS.md log commands work.
  - Added dependencies: `sqlalchemy`, `asyncpg`, `alembic`, `psycopg2-binary` via `uv add`.
  - Created `backend/app/core/config.py` to read `DATABASE_URL` and `DATABASE_URL_SYNC` from env vars.
  - Created `backend/app/db/session.py` with async SQLAlchemy engine/session.
  - Created SQLAlchemy models: `Circuit`, `Session`, `Driver`, `SessionResult`, `Weather`.
  - Initialized Alembic and generated initial migration `c2df5d3f5cfb_initial_schema`.
  - Applied migration to PostgreSQL; verified tables created.
  - Fixed frontend Dockerfile healthcheck to use `127.0.0.1` instead of `localhost` (IPv6 issue).
  - Updated `AGENTS.md` backend build command to match new Dockerfile build context.
- Verification run:
  - `docker build -t f1-backend -f backend/Dockerfile .` ✓
  - `docker build -t f1-frontend ./frontend` ✓
  - `docker ps` — all containers Up and healthy ✓
  - `docker logs f1-backend` — uvicorn running, health checks 200 ✓
  - `docker logs f1-frontend` — nginx started successfully ✓
- Commits:
  - `7a7faf0 feat(infra): add postgresql service and migrate docker to uv`
  - `23b8769 feat(backend): add sqlalchemy models and alembic initial migration`
- Files or artifacts updated:
  - `pyproject.toml`, `uv.lock`
  - `docker-compose.yaml`
  - `backend/Dockerfile`
  - `frontend/Dockerfile`
  - `AGENTS.md`
  - `backend/app/core/config.py`
  - `backend/app/db/session.py`
  - `backend/app/models/*`
  - `backend/alembic/*`, `backend/alembic.ini`
  - `frontend/pnpm-lock.yaml`
- Known risk or unresolved issue:
  - Existing `f1_service.py` still calls OpenF1 API directly; will be refactored in Phase 3.
  - `frontend/src/app.js` still hardcodes `http://localhost:8000`; to be addressed with env vars in a future frontend refactor.
- Next best step: Implement Phase 2 — modular ETL pipeline with CSV intermediate layer.

### Session 002

- Date: 2026-06-22/23
- Goal: Implement Phase 2 — modular ETL pipeline with CSV intermediate verification layer, plus normalización del esquema de drivers.
- Completed:
  - Created `backend/etl/` structure with `extract/`, `transform/`, `load/`, `raw/`, `staging/`.
  - Added `backend/etl/config.py` with env-var based settings for OpenF1 URL, years, delays, paths.
  - Created `backend/etl/extract/client.py` with retries, rate-limit backoff, and 404 handling.
  - Created modular extraction scripts: `sessions.py`, `drivers.py`, `results.py`, `weather.py` (all resumable).
  - Extracted 2023 season: 118 sessions, 2266 driver records, 2224 result records, 4206 weather records.
  - Created transformation scripts: `circuits.py`, `sessions.py`, `drivers.py`, `results.py`, `weather.py`.
  - Normalized `gap_to_leader` into numeric + raw columns; deduplicated drivers/results; validated FKs.
  - Generated staging CSVs and reviewed them (agent verification layer).
  - Created `backend/etl/load/csv_to_postgres.py` using `COPY` in a single transaction.
  - Loaded 2023 data into PostgreSQL: 23 circuits, 118 sessions, 2266 drivers, 2224 results, 4206 weather readings.
  - Verified sample join query (Bahrain Race top 5) matches expected F1 2023 results.
  - Added `backend/etl/raw/` to `.gitignore`; committed staging CSVs for auditability.
  - **Post-review normalization:**
    - Split denormalized `drivers` table into:
      - `drivers` (PK: `driver_number`, columns: `full_name`) — 46 rows.
      - `driver_sessions` (PK: `session_key, driver_number`, columns: `team_name`) — 2266 rows.
    - Removed redundant columns from `sessions`: `circuit_short_name`, `country_name`, `location`.
    - Created Alembic migration `5f8ae59ccc8a_normalize_drivers_and_drop_redundant_session_columns`.
    - Updated ETL transform/load scripts and regenerated staging CSVs with the new schema.
    - Reloaded data and verified with JOIN query.
- Verification run:
  - `docker build -t f1-backend -f backend/Dockerfile .` ✓
  - `docker build -t f1-frontend ./frontend` ✓
  - `docker ps` — all containers Up and healthy ✓
  - `docker logs f1-backend` — uvicorn running ✓
  - `docker logs f1-frontend` — nginx started ✓
  - Database counts verified via `psql` ✓
  - Schema verified: `sessions` sin columnas redundantes, `drivers` PK en `driver_number`, `driver_sessions` con FKs ✓
  - JOIN query Bahrain Race top 5 devuelve equipos correctos ✓
- Commits: (pending)
- Files or artifacts updated:
  - `.gitignore`
  - `backend/etl/config.py`
  - `backend/etl/extract/client.py`
  - `backend/etl/extract/sessions.py`
  - `backend/etl/extract/drivers.py`
  - `backend/etl/extract/results.py`
  - `backend/etl/extract/weather.py`
  - `backend/etl/transform/utils.py`
  - `backend/etl/transform/circuits.py`
  - `backend/etl/transform/sessions.py`
  - `backend/etl/transform/drivers.py`
  - `backend/etl/transform/results.py`
  - `backend/etl/transform/weather.py`
  - `backend/etl/load/csv_to_postgres.py`
  - `backend/etl/run_pipeline.py`
  - `backend/etl/staging/*.csv`
  - `backend/app/models/__init__.py`
  - `backend/app/models/session.py`
  - `backend/app/models/driver.py`
  - `backend/app/models/driver_session.py` (new)
  - `backend/alembic/versions/5f8ae59ccc8a_normalize_drivers_and_drop_redundant_session_columns.py`
- Known risk or unresolved issue:
  - ETL scripts are designed to run from the host with `uv` venv; not yet containerized.
  - Raw JSON files are gitignored and can be regenerated; staging CSVs are committed for auditability.
  - `f1_service.py` still queries OpenF1 API directly; Phase 3 will replace this with DB queries.
- Next best step: Implement Phase 3 — refactor backend services to query PostgreSQL and add cache layer.
