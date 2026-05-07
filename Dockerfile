# ── Frontend build ──────────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /build/frontend
COPY frontend/ .
RUN npm install && npm run build

# ── Backend runtime ─────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

# Copy built frontend
COPY --from=frontend /build/frontend/dist ./static

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Environment
ENV STATIC_DIR=/app/static
EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port $PORT
