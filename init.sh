#!/usr/bin/env bash
set -euo pipefail

# One-time environment setup and integrity verification for the F1 2023 Season project.

# --- Setup ---

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

# --- Verification ---

echo ""
echo "==> Verifying containers..."
if docker ps --format '{{.Names}} {{.Status}}' | grep -q 'f1-backend.*Up'; then
  echo "f1-backend is Up"
else
  echo "f1-backend is not running"
  docker ps
  exit 1
fi

if docker ps --format '{{.Names}} {{.Status}}' | grep -q 'f1-frontend.*Up'; then
  echo "f1-frontend is Up"
else
  echo "f1-frontend is not running"
  docker ps
  exit 1
fi

echo ""
echo "==> Auditing logs (last 5 lines each)..."
echo "--- Backend ---"
docker logs f1-backend --tail 5 2>&1
echo ""
echo "--- Frontend ---"
docker logs f1-frontend --tail 5 2>&1

echo ""
echo "==> All checks passed. Environment is ready."
