#!/usr/bin/env bash
#
# Build all services (used in CI).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Building all Docker images..."
docker compose build

echo "==> Running database migrations..."
# mongo-init.js runs automatically on first mongo start
docker compose up -d mongo redis
docker compose exec mongo mongosh --quiet --eval "db.adminCommand('ping').ok" || true

echo "==> Running backend tests..."
docker compose run --rm backend npm test

echo "==> Running AI service tests..."
docker compose run --rm ai-service python -m pytest tests/ -v

echo "==> Done."