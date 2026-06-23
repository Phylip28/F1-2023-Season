# Progress Log

## Current Verified State

- Repository root: `/home/phylip/Downloads/F1-2023-Season`
- Standard startup path: `./init.sh` ✓
- Standard verification path: AGENTS.md Section 3 ✓
- Current highest-priority unfinished feature: ETL pipeline (Phase 2)
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
- Commits: (pending)
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
