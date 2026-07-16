# Backend README

## What is this?

The **Python FastAPI backend** for ArticleIQ. It will perform NLP preprocessing,
summarization, sentiment detection, keyword/entity extraction, and Q&A.

## Checkpoint status

| Checkpoint | Status |
|------------|--------|
| 2 Folder structure | Done |
| 3 FastAPI foundation | Done |
| 4 Config / `.env` typing | Done — pydantic-settings + `.env.example` |
| Feature APIs | Later |

## Configuration (Checkpoint 4)

```bash
cd backend
cp .env.example .env
# Edit .env — add GEMINI_API_KEY later (Checkpoint 9)
```

**Load order (later wins):** code defaults → `.env` file → real environment variables.

**Never commit `.env`.** Only commit `.env.example` (no secrets).

## Setup & run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Verify

- http://localhost:8000/docs
- http://localhost:8000/health — includes `"gemini_configured": false` until you add a key
- http://localhost:8000/api/v1/ping

## Mental model

```text
.env / environment variables
        ↓
  Settings (pydantic-settings)
        ↓
  main.py, services, adapters
```

FastAPI is the framework. Uvicorn is the HTTP server. Settings are the control panel.
