"""FastAPI application entrypoint.

Checkpoint 3 will create the FastAPI instance, CORS, and health route here
(or via an application factory pattern).

Why this file exists:
  Uvicorn (ASGI server) needs a single import path like `app.main:app`.

Who will import it:
  Uvicorn / process managers — not the frontend directly.
"""
