# 🛡 TruthGuard AI — Fake News Detection Platform

A production-grade AI-powered platform that detects fake news, misinformation, and misleading content across **text**, **URLs**, and **images**.

## ✨ Features

- **Multi-model ensemble** — BERT, RoBERTa, and DistilBERT (or heuristic fallback)
- **Manipulation indicators** — Clickbait, emotional manipulation, sensationalism
- **Claim extraction** with fact verification against trusted sources
- **Source credibility analysis** for URLs (domain age, TLD, sensational keywords)
- **Image analysis** with metadata extraction (OCR/deepfake hooks ready)
- **Beautiful dark UI** — Modern, responsive, accessible
- **Secure by default** — JWT auth, bcrypt, rate limiting, SSRF protection, regex injection guards
- **Production-ready** — Docker, health checks, graceful shutdown, structured logging

## 🏗 Architecture

```
┌────────────┐    HTTPS    ┌──────────────┐   HTTP    ┌─────────────┐
│  React UI  │ ──────────► │  Node.js API │ ────────► │ Python AI   │
│  (Vite)    │              │  (Express)   │           │ (FastAPI)   │
└────────────┘              └──────┬───────┘           └─────────────┘
                                  │                         │
                            ┌─────┴─────┐              ┌───┴────┐
                            ▼           ▼              ▼        ▼
                       ┌────────┐ ┌────────┐      ┌────────┐ ┌────┐
                       │  Mongo │ │ Redis  │      │ spaCy  │ │NL  │
                       └────────┘ └────────┘      └────────┘ └────┘
```

## 🚀 Quick Start (Docker — Recommended)

```bash
# 1. Clone and configure
git clone <repo> && cd fake-news-platform
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env

# 2. Generate secure JWT secrets (32+ chars)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Copy each value into backend/.env as JWT_SECRET and JWT_REFRESH_SECRET

# 3. Start the full stack
docker compose up --build
```

Open:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:5000
- **AI Service docs** → http://localhost:8000/docs

## 🛠 Local Development (without Docker)

```bash
./scripts/setup.sh
```

This installs backend, frontend, and Python dependencies and copies `.env` templates.

Then run each service in its own terminal:

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — AI service
cd ai-service && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 3 — frontend
cd frontend && npm run dev
```

Requires MongoDB and Redis running locally (or via `docker compose up -d mongo redis`).

## 🧪 Seed Reference Data

```bash
cd backend
node scripts/seed.js
```

Inserts domain credibility entries (trusted/satire/unreliable) into the source cache.
No hardcoded users or passwords are created.

Register your own account after seeding:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Your Name","email":"you@example.com","password":"StrongPass1!"}'
```

## 📚 API Reference

### Auth
- `POST /api/auth/register` — `{name, email, password}` → `{user, accessToken, refreshToken}`
- `POST /api/auth/login` — `{email, password}` → `{user, accessToken, refreshToken}`
- `POST /api/auth/refresh` — `{refreshToken}` → `{accessToken, refreshToken}`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Analysis
- `POST /api/analyze/text` — `{text, options?}` → full analysis result
- `POST /api/analyze/url` — `{url, options?}` → URL extraction + analysis
- `POST /api/analyze/image` — multipart `image` file

### Reports
- `GET    /api/reports` — paginated history (`page`, `limit`, `type`, `classification`, `search`)
- `GET    /api/reports/:id` — single report
- `DELETE /api/reports/:id`
- `GET    /api/reports/stats` — dashboard statistics

## 🧬 AI Pipeline

1. **NLP preprocessing** — clean, normalize, tokenize, lemmatize (spaCy)
2. **Indicator scoring** — clickbait, emotional, sensational, misleading
3. **Claim extraction** — surface factual claims using verb-led detection
4. **Fact verification** — cross-check claims against trusted sources
5. **Model ensemble** — BERT + RoBERTa + DistilBERT (heuristic fallback)
6. **Trust scoring** — weighted combination → 0-100 score, classification, reasoning

### Trust Score Formula

```
trust = (model_score * 0.55)
      + (indicator_cleanliness * 0.30)
      + (claim_verification_ratio * 0.15)
```

Where:
- `model_score` = P(real) × 100 from ensemble
- `indicator_cleanliness` = 100 − (weighted manipulation penalty)
- `claim_verification_ratio` = % of claims verified

Classification thresholds: **real** ≥ 65, **fake** ≤ 35, else **suspicious**.

## 🔒 Security

| Layer | Implementation |
|-------|----------------|
| Passwords | bcrypt with 12 salt rounds |
| JWT | HS256, 15-min access, 7-day refresh |
| HTTP | Helmet, CSP, CORS whitelist, HSTS-ready |
| Rate limit | 100/min general, 50/hr analysis, 10/15min auth |
| Input | express-validator + sanitize-html + mongoSanitize |
| URL fetch | SSRF guard blocks private IPs & metadata services |
| Mongo | Regex injection guarded via `escapeRegex` |
| API key | Internal X-API-Key between backend ↔ AI service |

## 🧱 Project Structure

```
fake-news-platform/
├── backend/         Node.js + Express + Mongoose
├── frontend/        React + Vite + Tailwind
├── ai-service/      Python + FastAPI + spaCy
├── docker/          mongo-init.js, redis.conf
├── docs/            PRD, HLD, LLD, ARCHITECTURE
├── scripts/         setup.sh, build-all.sh
└── docker-compose.yml
```

## 🧪 Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# AI service
cd ai-service && python -m pytest tests/ -v
```

## 📦 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for AWS / Render / Railway guides.

Quick checklist:
1. Generate 32+ char secrets: `openssl rand -hex 48`
2. Set `NODE_ENV=production` in backend
3. Set `CORS_ORIGIN` to your real frontend domain
4. Build & push images
5. Run `docker compose up -d` on your server

## 📄 License

MIT