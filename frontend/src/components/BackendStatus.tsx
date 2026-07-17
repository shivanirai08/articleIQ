"use client";

import { useEffect, useState } from "react";

import { ApiError, fetchHealth } from "@/lib/api";

type Status = "loading" | "connected" | "error";

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
      <div
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]"
        aria-live="polite"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--muted)]" />
        Connecting
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="max-w-xs rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]"
        role="alert"
      >
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2" aria-live="polite">
      <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--success)]/25 bg-[var(--success-bg)] px-3 py-2 text-sm text-[var(--success)]">
        <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
        API ready
      </div>
      {!llmReady && (
        <p className="max-w-[14rem] text-right text-xs leading-snug text-[var(--warn)]">
          LLM key missing — summary, sentiment &amp; Q&amp;A unavailable
        </p>
      )}
    </div>
  );
}
