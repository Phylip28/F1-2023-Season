# Step 1: Build virtual environment with uv
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev


# Step 2: Set up the final image
FROM python:3.11-slim AS final
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY backend/app ./app
# Create a new user and set permissions
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
# Set environment variables and switch to new user
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
USER appuser
# Expose port, set healthcheck, and upon container start
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
