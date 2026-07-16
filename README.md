# ArticleIQ

Intelligent News Summarization, Sentiment Analysis & Question Answering System using NLP and Large Language Models.

## Problem statement

Large volumes of online news make it difficult for users to quickly understand important events. ArticleIQ is an intelligent system that can:

- Summarize lengthy news articles
- Identify sentiment
- Extract important keywords and entities
- Answer user queries related to the article
- Present results through an interactive web interface

## Objectives

| # | Objective | Implementation |
|---|-----------|----------------|
| O1 | NLP preprocessing | `POST /api/v1/preprocess` |
| O2 | Concise summaries | `POST /api/v1/summarize` |
| O3 | Sentiment detection | `POST /api/v1/sentiment` |
| O4 | Keywords & entities | `POST /api/v1/keywords`, `/entities` |
| O5 | Q&A (prompt engineering) | `POST /api/v1/qa` |
| O6 | Interactive web UI | Next.js workspace at `/` |

## Architecture

```text
Browser (Next.js :3000)
        │  REST / JSON
        ▼
FastAPI (:8000)
  ├── Classical NLP — spaCy (keywords, NER, tokenize)
  └── LLM — Groq/Grok (summary, sentiment, Q&A)
```

**Orchestrator:** `POST /api/v1/analyze` runs all analysis sections in one call.

## Repository layout

```text
articleIQ/
├── backend/          # FastAPI + NLP + LLM
├── frontend/       # Next.js UI
├── scripts/        # Demo script
├── docker-compose.yml
├── render.yaml     # Backend deploy blueprint
└── README.md
```

## Quick start (local)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env   # add GROK_API_KEY
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

UI: http://localhost:3000

### Demo script (viva)

With backend running:

```bash
chmod +x scripts/demo.sh
./scripts/demo.sh
```

## Deployment

Recommended stack: **Render** (backend) + **Vercel** (frontend).

### 1. Backend → Render

1. Push repo to GitHub
2. Create a **Web Service** on [Render](https://render.com) → connect repo
3. Use `render.yaml` or set:
   - **Root directory:** `backend`
   - **Docker** or build: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
   - **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment variables:

| Variable | Value |
|----------|-------|
| `GROK_API_KEY` | Your Groq key (`gsk_…`) |
| `APP_ENV` | `production` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |

Health check path: `/health`

### 2. Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Environment variable:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-api.onrender.com` |

4. Deploy — Vercel builds Next.js automatically

### 3. Docker (optional)

```bash
# Backend only
docker build -t articleiq-api ./backend
docker run -p 8000:8000 --env-file backend/.env articleiq-api

# Full stack
docker compose up --build
```

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness + config flags |
| POST | `/api/v1/analyze` | Full analysis (O2–O4) |
| POST | `/api/v1/summarize` | Abstractive summary |
| POST | `/api/v1/sentiment` | Sentiment + rationale |
| POST | `/api/v1/keywords` | Keyword extraction |
| POST | `/api/v1/entities` | Named entity recognition |
| POST | `/api/v1/qa` | Grounded Q&A |
| POST | `/api/v1/preprocess` | Text cleaning |
| POST | `/api/v1/tokenize` | spaCy tokenization |

## Testing

```bash
cd backend && pytest tests/ -q
cd frontend && npm run build
```

CI runs both on push (`.github/workflows/ci.yml`).

## Viva talking points (60 seconds)

1. **Hybrid NLP + LLM** — spaCy for explainable structure; Groq for generation
2. **Prompt engineering** — role, constraints, delimiters, JSON schema, refusal for Q&A
3. **Clean architecture** — routes → services → adapters; orchestrator composes services
4. **Partial failure** — analyze returns NLP results even if LLM is down
5. **Security** — API keys server-side only; CORS restricts browser origins

## Academic note

- **Classical NLP** — preprocessing, keywords, NER (explainable)
- **LLMs** — summary, sentiment, Q&A (prompt engineering)
- **Web UI** — single workspace demonstrating the full pipeline

## Status

**Project complete** — all 18 checkpoints implemented (local + deploy-ready).
