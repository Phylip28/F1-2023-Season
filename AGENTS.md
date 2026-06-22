# AGENTS.md - F1 2023 Season Map & Constraints

This repository is designed for long-running coding-agent work. The goal is not
to maximize raw code output. The goal is to leave the repo in a state where the
next session can continue without guessing.

## First-Time Execution Commands
1. **Sync backend:** `uv sync`
2. **Activate virtual environment:** `source .venv/bin/activate`
3. **Install frontend:** `cd frontend && pnpm install`
4. **Spin up infrastructure:** (See automation cycle in Section 3 for Docker commands)

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
