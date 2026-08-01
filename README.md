<div align="center">

# 🛡️ TruthGuard AI
### Production-Grade Deep Learning & NLP Fake News Detection Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Backend-Express.js-83CD29.svg?logo=nodedotjs)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/AI--Service-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?logo=react)](https://react.dev)
[![Docker](https://img.shields.io/badge/Deployment-Docker--Compose-2496ED.svg?logo=docker)](https://docker.com)

[Features](#-key-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [API Specs](#-api-specifications) • [AI Engine](#-ai-detection-engine) • [Security](#-security--hardening)

---

</div>

## 📌 Executive Summary

**TruthGuard AI** is an enterprise-level multi-modal platform designed to combat online misinformation, clickbait, and unverified claims. By leveraging a high-performance transformer ensemble (BERT, RoBERTa, DistilBERT), linguistic pattern analysis, and domain credibility scoring, TruthGuard delivers rapid, explainable trust metrics for raw text inputs, web article URLs, and media files.

---

## ✨ Key Features

- 🧠 **Transformer Ensemble Intelligence** — Dual-mode prediction combining fine-tuned transformer models with a lightweight heuristic fallback.
- 🔍 **Automated Claim Extraction** — Syntactic dependency parsing to extract factual assertions and cross-reference trusted knowledge sources.
- 🎯 **Multi-Factor Manipulation Detection** — Real-time scoring for clickbait headlines, emotional manipulation, and sensationalism.
- 🌐 **URL & Source Credibility Engine** — Automated metadata extraction, TLD trust inspection, domain age evaluation, and blacklist/whitelist lookups.
- 🖼️ **Media Metadata Extraction** — Processing pipeline ready for EXIF inspection, OCR text parsing, and deepfake signals.
- ⚡ **High-Performance Architecture** — Asynchronous FastAPI AI microservice with Redis query caching and MongoDB storage.
- 🔒 **Enterprise-Grade Hardening** — Full JWT authentication with token rotation, SSRF guards, rate limiting, and parameter sanitization.
- 🎨 **Modern Dark UI/UX** — Fully responsive React dashboard featuring dynamic trust gauges, history filtering, and CSV export capabilities.

---

## 💻 Tech Stack

| Domain | Technologies & Frameworks |
|---|---|
| **Frontend** | React 18, Vite, Context API, Vanilla CSS (Custom Design System), Lucide Icons |
| **Backend API** | Node.js (v18+), Express.js, Mongoose, Winston Logger, Express Validator |
| **AI Microservice** | Python 3.10+, FastAPI, PyTorch, HuggingFace Transformers (BERT/RoBERTa), spaCy, Pydantic |
| **Databases & Cache** | MongoDB (Primary Storage), Redis (Caching & Rate Limiting Key-Value Store) |
| **DevOps & Infra** | Docker, Docker Compose, Nginx, Health Check Probes |

---

## 🏗️ System Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │              Client Browser (React 18 + Vite)           │
               └───────────────────────────┬────────────────────────────┘
                                           │ HTTPS / REST API
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │           Backend API Gatekeeper (Express.js)          │
               │   [JWT Auth | Rate Limiter | SSRF Guard | CORS Policy]  │
               └───────────────┬────────────────────────┬───────────────┘
                               │                        │
               ┌───────────────▼────────┐      ┌────────▼──────────────┐
               │ MongoDB (Data Store)   │      │ Redis Cache & Limits   │
               └────────────────────────┘      └────────────────────────┘
                                                        │ HTTP (Protected)
                                                        ▼
                                       ┌────────────────────────────────┐
                                       │    AI Service (FastAPI / PyTorch)│
                                       │ [BERT | spaCy | Claim Extractor]│
                                       └────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/get-started) installed on your system.

### Running with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BYTEZEN-11/FACENOVA.git
   cd FACENOVA
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp ai-service/.env.example ai-service/.env
   ```

3. **Spin Up Containers:**
   ```bash
   docker compose up --build -d
   ```

4. **Access the Services:**
   - 🌐 **Web Dashboard:** `http://localhost:5173`
   - 🔌 **Backend API Base:** `http://localhost:5000/api`
   - 🤖 **AI Microservice Swagger Docs:** `http://localhost:8000/docs`

---

## 🛠️ Local Development (Native)

If you prefer executing services without Docker:

```bash
# 1. Install Dependencies across all services
cd backend && npm install
cd ../frontend && npm install
cd ../ai-service && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# 2. Run Local MongoDB and Redis services
docker compose up -d mongo redis

# 3. Start Development Servers
# Backend (Terminal 1)
cd backend && npm run dev

# AI Service (Terminal 2)
cd ai-service && uvicorn app.main:app --reload --port 8000

# Frontend (Terminal 3)
cd frontend && npm run dev
```

---

## 📚 API Specifications

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue tokens | Public |
| `POST` | `/api/auth/refresh` | Refresh expired access token | Public |
| `POST` | `/api/auth/logout` | Revoke session refresh token | Authenticated |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |

### Analysis Routes (`/api/analyze`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/analyze/text` | Perform deep NLP scan on raw text input | Authenticated |
| `POST` | `/api/analyze/url` | Extract web article & run credibility scan | Authenticated |
| `POST` | `/api/analyze/image` | Process image upload & inspect EXIF metadata | Authenticated |

### Report Management (`/api/reports`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/reports` | Fetch paginated scan history | Authenticated |
| `GET` | `/api/reports/:id` | Retrieve single analysis breakdown | Authenticated |
| `DELETE` | `/api/reports/:id` | Soft delete analysis record | Authenticated |
| `GET` | `/api/reports/stats` | Fetch user dashboard metrics | Authenticated |

---

## 🧬 AI Detection Engine

The credibility score ($S_{\text{trust}}$) is computed via a multi-layered weighted model:

$$S_{\text{trust}} = (W_m \cdot S_{\text{ensemble}}) + (W_i \cdot S_{\text{indicators}}) + (W_c \cdot R_{\text{verified}})$$

Where:
- $S_{\text{ensemble}}$: Ensemble classifier output probability for authentic content.
- $S_{\text{indicators}}$: Penalized score calculated from clickbait, emotional, and sensational indicators.
- $R_{\text{verified}}$: Ratio of extracted factual claims matching verified datasets.
- Thresholds: **Authentic** ($\ge 65$), **Suspicious** ($36-64$), **Misleading/Fake** ($\le 35$).

---

## 🔒 Security & Hardening

- **Authentication:** HS256 JWT pair with short-lived access tokens (15 mins) and rotatable refresh tokens (7 days).
- **Protection Against Injection:** Strict NoSQL query sanitization (`mongoSanitize`) and HTML escaping (`sanitize-html`).
- **SSRF Defenses:** Internal URL fetcher resolves DNS and blocks private IPv4/IPv6 ranges and cloud metadata IPs (`169.254.169.254`).
- **Rate Limiting:** IP and user-based throttling across login, general API, and high-compute inference endpoints via Redis.
- **HTTP Security Headers:** Helmet.js integrated with strict CSP rules, HSTS, X-Content-Type-Options, and frameguard.

---

## 📂 Project Layout

```text
fake-news-platform/
├── ai-service/             # FastAPI NLP & Transformer Microservice
│   ├── app/                # Application logic (routers, models, indicators, services)
│   ├── tests/              # Pytest unit & integration test suite
│   ├── Dockerfile          # Python service container manifest
│   └── requirements.txt    # Dependencies specification
├── backend/                # Express.js REST API Gateway
│   ├── src/                # Controllers, models, routes, middleware, services
│   ├── scripts/            # Database seed and maintenance scripts
│   ├── Dockerfile          # Node.js service container manifest
│   └── package.json        # Dependencies & script commands
├── frontend/               # React 18 Dashboard Application
│   ├── src/                # Components, hooks, context, pages, styles
│   ├── Dockerfile          # Vite production build & Nginx container manifest
│   └── package.json        # Frontend dependencies
├── docker/                 # Container configuration files (redis.conf, mongo-init.js)
├── docker-compose.yml      # Orchestration definition for multi-container stack
└── README.md               # System documentation
```

---

## 🧪 Testing

```bash
# Run Backend API unit tests
cd backend && npm test

# Run AI Microservice test suite
cd ai-service && pytest tests/ -v

# Run Frontend component tests
cd frontend && npm test
```

---

## 👤 Author & Maintainer

**bytezen-11**  
📧 Contact: [shingh979875@gmail.com](mailto:shingh979875@gmail.com)  
🐙 GitHub: [@BYTEZEN-11](https://github.com/BYTEZEN-11)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.