# Backend README

## What is this?

The **Python FastAPI backend** for ArticleIQ. It will perform NLP preprocessing,
summarization, sentiment detection, keyword/entity extraction, and Q&A.

## Why a separate `backend/` folder?

The interactive web UI (Objective O6) must not hold secrets or heavy NLP models
in the browser. The backend is the trust boundary: it owns API keys, spaCy, and
Gemini calls.

## Checkpoint status

| Checkpoint | Status |
|------------|--------|
| 2 Folder structure | Done |
| 3 FastAPI foundation | Done — health + ping + CORS + `/docs` |
| 4 Config / `.env` typing | Next |
| Feature APIs | Later |

## Folder map (objectives → code)

| Objective / feature | Route module | Service module | Notes |
|---------------------|--------------|----------------|-------|
| O1 Preprocessing | (used by all) | `services/preprocessing.py` | CP7 |
| O2 Summaries | `api/v1/summarize.py` | `services/summarize.py` | CP10 |
| O3 Sentiment | `api/v1/sentiment.py` | `services/sentiment.py` | CP11 |
| O4 Keywords | `api/v1/keywords.py` | `services/keywords.py` | CP12 |
| Entities | `api/v1/entities.py` | `services/entities.py` | CP13 |
| O5 Q&A prompts | `api/v1/qa.py` | `services/qa.py` + `prompts/` | CP14 |
| O6 UI support | `api/v1/analyze.py` | `services/analyze.py` | CP15–16 |

## Setup (Checkpoint 3)

From the `backend/` directory:

```bash
# 1) Create an isolated Python environment
python3 -m venv .venv

# 2) Activate it
source .venv/bin/activate

# 3) Install dependencies
pip install -r requirements.txt

# 4) Run the API (reload = auto-restart on code changes)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Verify

- OpenAPI docs: http://localhost:8000/docs
- Health: http://localhost:8000/health
- Versioned ping: http://localhost:8000/api/v1/ping

## Important mental model

```text
Browser / docs UI  →  Uvicorn (ASGI server)  →  FastAPI `app`  →  your route functions
```

FastAPI is the framework. Uvicorn is the process that speaks HTTP to the world.
