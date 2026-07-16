"use client";

import { useEffect, useState } from "react";

import { ApiError, fetchHealth } from "@/lib/api";
import { apiBaseUrl } from "@/lib/config";
import type { HealthResponse } from "@/types/health";

type Status = "loading" | "connected" | "error";

/** Shows whether the browser can reach the FastAPI backend (CORS + network). */
export function BackendStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchHealth();
        if (!cancelled) {
          setHealth(data);
          setStatus("connected");
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setHealth(null);
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : "Could not reach backend. Is uvicorn running on port 8000?",
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusStyles: Record<Status, string> = {
    loading: "border-[var(--border)] bg-[var(--accent-muted)]/30",
    connected: "border-emerald-500/40 bg-emerald-500/10",
    error: "border-red-500/40 bg-red-500/10",
  };

  return (
    <section
      className={`rounded-xl border p-5 ${statusStyles[status]}`}
      aria-live="polite"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Backend connection
      </h2>

      {status === "loading" && (
        <p className="mt-2 text-sm">Checking {apiBaseUrl}/health …</p>
      )}

      {status === "connected" && health && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">Service</dt>
            <dd className="font-medium">{health.service}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Environment</dt>
            <dd className="font-medium">{health.environment}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Status</dt>
            <dd className="font-medium text-emerald-600 dark:text-emerald-400">
              {health.status}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">LLM configured</dt>
            <dd className="font-medium">
              {health.llm_configured ? "Yes (Grok/Groq)" : "No — set GROK_API_KEY"}
            </dd>
          </div>
        </dl>
      )}

      {status === "error" && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </section>
  );
}
