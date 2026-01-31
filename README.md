# F1 2023 Season

Web application for visualizing Formula 1 2023 season data with interactive circuit navigation and session filtering.

## Architecture

The architecture used is microservices. We know that this one requires high infrastructure cost, but for this project only two services exist, so regarding doesn't exist. By the way, the main idea is to follow the best practices for AWS implementation.

### **Services:**

**Backend:** FastAPI service that fetches data from the OpenF1 API and provides endpoints for circuit sessions.

**Frontend:** Vanilla JS application with Vite bundler, featuring interactive circuit visualization and session filtering.

## API Endpoints

`GET /` - Health check endpoint

`GET /season/summary/{circuit_key}` - Retrieves all sessions for a specific circuit

`POST /season/ft_session` - Filters sessions by type (Race, Qualifying, Practice)

## Project Structure

```
backend/
  app/
    main.py              # FastAPI application entry point
    routers/season.py    # Season endpoints
    services/f1_service.py  # OpenF1 API integration
    schemas/session.py   # Pydantic models
frontend/
  src/
    app.js              # Main application logic
    index.html          # Entry point
    styles.css          # Styling
    assets/circuits/    # Circuit SVG assets
```

## Automatization

With `GitHub Actions`, the project is configured to automatically build and push services images to `GitHub Container Registry` (GHCR) on every push to the `trunk` branch only with the modified files affect code.

## Running the Application

1. Build services with Docker Compose:

```bash
docker compose build
```

2. Start both services with Docker Compose:

```bash
docker compose up -d
```

Access the application at http://localhost

The backend API is available at http://localhost:8000

## Technology Stack

**Backend:** FastAPI, Uvicorn, Pydantic, Requests

**Frontend:** Vite, Vanilla JavaScript

**DevOps:** Docker, Docker Compose, GitHub Actions, GHCR
