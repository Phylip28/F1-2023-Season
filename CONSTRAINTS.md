# CONSTRAINTS.md

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
- **CI Matrix Dockerfile Paths:** Dockerfile paths are parameterized in the matrix strategy of the CI workflow (`.github/workflows/`). DO NOT move, rename, or delete a service Dockerfile without updating the matching `context` and `dockerfile` entries in the same commit. Duplicate or stale paths will break the image build pipeline.
- **No Emojis in Output:** Never use emoji characters in script output, log messages, or commit messages unless explicitly requested by the user. Use plain text indicators instead (e.g., `[OK]`, `[FAIL]`, `[DONE]`).

## 3. Automation & Verification
