"use client";

import { useEffect, useState } from "react";

import { ApiError, fetchHealth } from "@/lib/api";

type Status = "loading" | "connected" | "error";

/** Compact connection indicator — details only when something is wrong. */
export function BackendStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [llmReady, setLlmReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchHealth();
        if (!cancelled) {
          setLlmReady(data.llm_configured);
          setStatus("connected");
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setLlmReady(false);
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : "Cannot reach the API. Start the backend on port 8000.",
          );
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]" aria-live="polite">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--muted)]" />
        Connecting…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        role="alert"
      >
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        API ready
      </span>
      {!llmReady && (
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-800 dark:text-amber-300">
          LLM unavailable — summary, sentiment &amp; Q&amp;A disabled
        </span>
      )}
    </div>
  );
}
