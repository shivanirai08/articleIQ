# Backend README

## What is this?

The **Python FastAPI backend** for ArticleIQ. It will perform NLP preprocessing,
summarization, sentiment detection, keyword/entity extraction, and Q&A.

## Why a separate `backend/` folder?

The interactive web UI (Objective O6) must not hold secrets or heavy NLP models
in the browser. The backend is the trust boundary: it owns API keys, spaCy, and
Gemini calls.

## Current checkpoint status

Checkpoint 2 created the **skeleton only**. There is no runnable FastAPI app yet.
That starts in Checkpoint 3.

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

## How to run (later)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Exact steps arrive with Checkpoint 3+.
