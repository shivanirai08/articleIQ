# Backend README

## What is this?

The **Python FastAPI backend** for ArticleIQ.

## Checkpoint status

| Checkpoint | Status |
|------------|--------|
| 3 FastAPI foundation | Done |
| 4 Config / `.env` | Done |
| 7 Preprocessing (O1) | Done |
| 8 spaCy tokenization | Done |
| 9 Gemini | Next |

## Setup & run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Required once for Checkpoint 8+ (spaCy English model ~13 MB)
python -m spacy download en_core_web_sm

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Key endpoints

| Endpoint | Purpose |
|----------|---------|
| GET `/health` | Liveness |
| POST `/api/v1/preprocess` | Text cleaning (O1) |
| POST `/api/v1/tokenize` | spaCy tokens + sentences |
| POST `/api/v1/validate-article` | Contract demo |

Open http://localhost:8000/docs for interactive API docs.

## spaCy note

If `/api/v1/tokenize` returns **503**, the model is missing:

```bash
python -m spacy download en_core_web_sm
```
