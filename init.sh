#!/usr/bin/env bash
set -euo pipefail

# One-time environment setup for the F1 2023 Season project.

echo "==> Syncing backend dependencies..."
uv sync

echo "==> Activating virtual environment..."
source .venv/bin/activate

echo "==> Installing frontend dependencies..."
cd frontend
pnpm install
cd ..

echo "==> Spinning up infrastructure..."
docker compose up --build -d

echo "==> Done. Run verification steps from AGENTS.md Section 3 before starting work."
