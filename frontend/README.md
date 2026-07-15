# Frontend README

## What is this?

The **interactive web interface** for ArticleIQ (Objective O6). Users will paste
an article, view summary/sentiment/keywords/entities, and ask questions.

## Why a separate `frontend/` folder?

UI concerns (layout, loading spinners, forms) are different from NLP/LLM
concerns. Separating them matches real-world full-stack systems and keeps the
Gemini API key off the client.

## Current checkpoint status

Checkpoint 2 created the **planned folder skeleton only**.
Next.js will be initialized properly in Checkpoint 5 (`create-next-app` / equivalent).

## Planned layout

```text
frontend/
├── src/
│   ├── app/           # pages (App Router)
│   ├── components/    # reusable UI pieces
│   ├── lib/           # API client helpers
│   ├── types/         # TypeScript contracts mirroring backend schemas
│   └── styles/        # global styles
├── public/            # static assets
└── package.json       # created when Next.js is initialized (CP5)
```

## How it will talk to the backend

```text
Browser form
  → frontend/src/lib (fetch helpers)
    → HTTP JSON
      → backend /api/v1/*
```

## How to run (later)

Instructions will be added in Checkpoint 5 after Next.js scaffolding.
