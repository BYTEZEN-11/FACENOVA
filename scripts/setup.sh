#!/usr/bin/env bash
#
# Development setup script.
# Installs dependencies for all three services and prepares .env files.
#
# Usage: ./scripts/setup.sh

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { printf "\n${YELLOW}==>${NC} %s\n" "$1"; }
ok()   { printf "${GREEN}✓${NC} %s\n" "$1"; }
fail() { printf "${RED}✗${NC} %s\n" "$1"; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

step "Checking prerequisites"
command -v node    >/dev/null 2>&1 || fail "node is required (>= 18)"
command -v npm     >/dev/null 2>&1 || fail "npm is required"
command -v python3 >/dev/null 2>&1 || fail "python3 is required (>= 3.11)"
ok "prerequisites look good"

step "Copying .env files (where missing)"
[ -f backend/.env ]      || cp backend/.env.example backend/.env      && ok "backend/.env"
[ -f frontend/.env ]     || cp frontend/.env.example frontend/.env    && ok "frontend/.env"
[ -f ai-service/.env ]   || cp ai-service/.env.example ai-service/.env && ok "ai-service/.env"
[ -f .env ]              || cp .env.example .env                       && ok ".env (root)"

step "Installing backend dependencies"
cd backend
npm install --no-fund --no-audit
ok "backend installed"

step "Installing frontend dependencies"
cd ../frontend
npm install --no-fund --no-audit
ok "frontend installed"

step "Setting up Python AI service"
cd ../ai-service
python3 -m venv venv || true
# shellcheck disable=SC1091
source venv/bin/activate 2>/dev/null || true
pip install --upgrade pip
pip install -r requirements.txt
ok "ai-service installed"
python -m spacy download en_core_web_sm 2>/dev/null || ok "(spaCy model will be downloaded at first run)"

cd "$ROOT"

echo
printf "${GREEN}✨ Setup complete!${NC}\n"
echo
echo "Next steps:"
echo "  1. Edit backend/.env with secure JWT_SECRET and JWT_REFRESH_SECRET (32+ chars)"
echo "  2. Start MongoDB and Redis locally OR run: docker compose up -d mongo redis"
echo "  3. Terminal 1: cd backend && npm run dev"
echo "  4. Terminal 2: cd ai-service && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  5. Terminal 3: cd frontend && npm run dev"
echo "  6. Open http://localhost:5173"
echo
echo "OR run the full stack with Docker:"
echo "  docker compose up --build"