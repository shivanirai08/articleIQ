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
├── docs/        # Local learning notes (gitignored — not part of submission history)
└── README.md    # This file
```

## Status

| Area | Status |
|------|--------|
| Planning & architecture | Done (Checkpoint 1) |
| Folder structure | Done (Checkpoint 2) |
| FastAPI app | Done (Checkpoint 3) — `/health`, `/api/v1/ping`, `/docs` |
| Typed config / `.env` | Not started (Checkpoint 4) |
| Next.js app | Not started (Checkpoint 5) |
| NLP / LLM features | Later checkpoints |

## How to run (backend — Checkpoint 3)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then open http://localhost:8000/docs

Frontend run instructions arrive in Checkpoint 5.

## Academic note

This project intentionally separates:

- **Classical NLP** (preprocessing, keywords, NER) — explainable fundamentals
- **Large Language Models** (summary, sentiment narrative, Q&A) — generative intelligence via prompt engineering
- **Web UI** — interactive demonstration of the full pipeline
