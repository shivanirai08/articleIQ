# Frontend README

## What is this?

The **interactive web interface** for ArticleIQ (Objective O6).

## Checkpoint status

| Checkpoint | Status |
|------------|--------|
| 5 Next.js foundation | Done — App Router shell + backend health check |
| 6 API contracts | Next |
| 16 Full UI integration | Later |

## Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

**Also run the backend** (separate terminal):

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

The home page calls `GET /health` to verify CORS and connectivity.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI origin (browser-safe) |

Only `NEXT_PUBLIC_*` vars are exposed to client JavaScript. **Never** put `GEMINI_API_KEY` here.

## Folder map

```text
src/app/          pages (App Router)
src/components/   reusable UI (BackendStatus, later analysis panels)
src/lib/          API helpers + config
src/types/        TypeScript contracts mirroring backend
```

## Scripts

- `npm run dev` — development server (:3000)
- `npm run build` — production build
- `npm run start` — serve production build
