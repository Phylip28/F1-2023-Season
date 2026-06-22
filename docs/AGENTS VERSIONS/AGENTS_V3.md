# AGENTS.md

This repository is designed for long-running coding-agent work. The goal is not
to maximize raw code output. The goal is to leave the repo in a state where the
next session can continue without guessing.

## Startup Workflow

Before writing code:

1. Confirm the working directory with `pwd`.
2. Read `PROGRESS.md` for the latest verified state and next step.
3. Review recent commits with `git log --oneline -5`.
4. Run `./init.sh`.

If baseline verification is already failing, fix that first. Do not stack new
feature work on top of a broken starting state.

## Working Rules

- Work on one feature at a time.
- Do not mark a feature complete just because code was added.
- Keep changes within the selected feature scope unless a blocker forces a
  narrow supporting fix.
- Do not silently change verification rules during implementation.
- Prefer durable repo artifacts over chat summaries.

## Required Artifacts

- `PROGRESS.md`: session log and current verified status
- `init.sh`: standard startup and verification path
- `session-handoff.md`: optional compact handoff for larger sessions

## End Of Session

Before ending a session:

1. Update `PROGRESS.md`.
2. Record any unresolved risk or blocker.
3. Commit with a descriptive message once the work is in a safe state.
4. Leave the repo clean enough for the next session to run `./init.sh` immediately.

## 1. System Architecture & Stack Map
- **Backend Stack:** Python 3.11 | FastAPI.
- **Backend Package Manager:** `uv` (Astral).
- **Backend Dependency File:** `pyproject.toml`.
- **Frontend Stack:** Node.js | React / TypeScript.
- **Frontend Package Manager:** `pnpm`.
- **Infrastructure:** Docker & Docker Compose.
- **Data Source:** OpenF1 API.

## 2. Strict Boundary Constraints
- **No Pip:** Never execute `pip install`. All dependency additions MUST use `uv add <package>` directly into `pyproject.toml`.
- **No Global Packages:** Do not install global pnpm modules. Use existing dependencies in `package.json`.
- **No Global Agent Skills:** Do not install agent skills, extensions, or tool packages globally on the host system. Any project package, skill configuration, or custom command extension must be isolated locally within the `.pi` directory or the project workspace.
- **No Hardcoded URLs:** External connection strings or local container communication (backend-frontend) must use environment variables. Do not use `localhost:8000`.
- **No Push:** Execution of `git push` is strictly prohibited.

## 3. Automation & Verification Loops
Before marking a task as resolved, you must execute this sequence in the terminal:  

### 3.1 Compilation & Image Build
1. **Backend Build:** `docker build -t f1-backend ./backend`.
2. **Frontend Build:** `docker build -t f1-frontend ./frontend`.

### 3.2 Runtime & Integrity Check
3. **Runtime Check:** `docker ps` (Containers must be status `Up`).
4. **Log Audit (Backend):** `docker logs f1-backend`.
5. **Log Audit (Frontend):** `docker logs f1-frontend`.

## 4. Version Control & Atomic Commits
- **Trigger:** Create a local Git commit immediately after a single file or specific feature passes all verification loops in Section 3.
- **Isolation:** Stage files selectively using `git add <file_path>`. Never use `git add .` unless all changes belong to the same atomic feature.
- **Format:** Use lowercase conventional commits. Examples: `feat(backend): add openf1 driver endpoint`, `fix(frontend): resolve card crash`.

## 5. Output Optimization
- Do not explain code philosophy or architectural choices.
- Output only the specific line modifications or newly created files.
- If a change breaks any verification loop, roll back the files using Git immediately.
