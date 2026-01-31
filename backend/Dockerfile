# Step 1: Install dependencies
FROM python:3.11-slim AS builder
# Create a workdir and update system packages
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*
# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \ 
    pip install --no-cache-dir -r requirements.txt


# Step 2: Set up the final image
FROM python:3.11-slim AS final
# Create a workdir and copy tools from the builder stage
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY ./app ./app
# Create a new user and set permissions
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
# Set environment variables and switch to new user
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
USER appuser
# Expose port, set healthcheck, and upon container start
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]