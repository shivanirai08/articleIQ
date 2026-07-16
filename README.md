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

1. Perform NLP preprocessing
2. Generate concise summaries
3. Detect sentiment
4. Extract important keywords (and named entities)
5. Generate question-answer responses using prompt engineering
6. Develop an interactive web interface

## Repository layout

```text
articleIQ/
├── backend/     # FastAPI + NLP + LLM services (Python)
├── frontend/    # Next.js interactive web UI (TypeScript)
└── README.md    # This file
```

## Status

| Area | Status |
|------|--------|
| Planning & architecture | Done (Checkpoint 1) |
| Folder structure | Done (Checkpoint 2) |
| FastAPI app | Done (Checkpoint 3) — `/health`, `/api/v1/ping`, `/docs` |
| Typed config / `.env` | Done (Checkpoint 4) — pydantic-settings |
| Next.js app | Done (Checkpoint 5) — shell + backend health check |
| API contracts | Done (Checkpoint 6) — Pydantic + TypeScript + validate demo |
| NLP preprocessing (O1) | Done (Checkpoint 7) — `POST /api/v1/preprocess` |
| spaCy tokenization | Done (Checkpoint 8) — `POST /api/v1/tokenize` |
| LLM (Grok/Groq) | Done — `POST /api/v1/llm/demo` |
| Summarization (O2) | Done — `POST /api/v1/summarize` |
| Sentiment (O3) | Done — `POST /api/v1/sentiment` |
| Keywords (O4) | Done — `POST /api/v1/keywords` |
| Entities / QA | Checkpoints 13+ |

## How to run (backend — Checkpoint 3)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then open http://localhost:8000/docs

**Config:** copy `backend/.env.example` to `backend/.env` before running.

**spaCy model (Checkpoint 8+):** `python -m spacy download en_core_web_sm`

**LLM (Checkpoint 9+):** set `GROK_API_KEY` in `backend/.env` ([Groq](https://console.groq.com/keys) or [xAI](https://console.x.ai/))

## How to run (frontend — Checkpoint 5)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 (run backend on :8000 in a second terminal).

## Academic note

This project intentionally separates:

- **Classical NLP** (preprocessing, keywords, NER) — explainable fundamentals
- **Large Language Models** (summary, sentiment narrative, Q&A) — generative intelligence via prompt engineering
- **Web UI** — interactive demonstration of the full pipeline
