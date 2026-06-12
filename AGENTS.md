# Agent.md

This document provides rules and guidelines for the project.

## 1. Backend & Dependency Constraints
- **Language:** Python 3.11+.
- **Dependency Management:** Use ONLY `pyproject.toml` (uv). Never install packages via raw `pip` inside the container manually. If a new dependency is required, append it to `pyproject.toml` using uv add before updating code
- The backend should be designed to be modular and extensible, allowing for easy integration of new features and components.
- The backend should follow best practices for code organization, readability, and maintainability.

## 2. API & Data Sourcing
- **Data Provider:** OpenF1 API.
- **Rule:** Use existing API client/wrapper modules if available in the repository. Do not hardcode external HTTP requests inside the endpoints; abstract the data fetching to a service layer.

## 3. Execution, Building & Verification (Harness Layer)
Before declaring any task as finished, you MUST verify the build state using these strict steps:

## 3.1 Build Verification

### Phase 1: Backend Verification
1. Execute `docker build -t f1-backend .` to ensure the backend container compiles.
2. Run `docker logs f1-backend` to verify there are no hidden Python tracebacks or import errors.

## Phase 2: Frontend Verification
1. Execute the frontend build command (e.g., `docker build -t f1-frontend .` or the correct command such as `npm run build`) to ensure the frontend compiles without errors.
2. Run `docker logs f1-frontend` to verify there are no hidden javascript tracebacks or import errors.
3. Verify that the changes in the user interface correspond to the new types or fields in the backend payload.

## Phase 3: Container Runtime Verification
1. **Runtime Check:** Deploy or check the status using `docker ps` to ensure the container remains in an `Up` status and does not enter a crash loop.

## 4. Output Optimization
- Do not explain code philosophy. 
- Provide only the direct file modifications or new files required.
- If a change breaks the Docker build, roll back the specific change immediately and re-evaluate the imports.
