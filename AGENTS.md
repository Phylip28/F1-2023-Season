# AGENTS.md - F1 2023 Season Map & Constraints

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
