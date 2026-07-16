"use client";

import { FormEvent, useState } from "react";

import { ApiError, llmDemo } from "@/lib/api";
import type { LlmDemoResponse } from "@/types";

const DEFAULT_MESSAGE = "What is sentiment analysis in news articles?";

type FormStatus = "idle" | "loading" | "success" | "error";

/** Demonstrates Grok/Groq LLM integration. Requires GROK_API_KEY on backend. */
export function LlmDemoForm() {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<LlmDemoResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await llmDemo(message);
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "LLM request failed. Is GROK_API_KEY set on the backend?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Grok / Groq LLM demo
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/llm/demo</code> uses your{" "}
        <code className="font-mono text-xs">GROK_API_KEY</code> (Groq or xAI). Key stays
        on the backend only.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          type="text"
          className="w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-label="Message for LLM"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Calling LLM…" : "Ask LLM"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 space-y-3">
          <p className="rounded-lg bg-[var(--accent-muted)]/30 p-3 text-sm leading-relaxed">
            {result.reply}
          </p>
          <dl className="grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
            <div>
              <dt>Model</dt>
              <dd className="font-medium text-[var(--foreground)]">{result.model}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {result.latency_ms} ms
              </dd>
            </div>
            <div>
              <dt>Tokens (in / out / total)</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {result.prompt_tokens ?? "—"} / {result.output_tokens ?? "—"} /{" "}
                {result.total_tokens ?? "—"}
              </dd>
            </div>
            <div>
              <dt>Temperature / max output</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {result.temperature} / {result.max_output_tokens}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </section>
  );
}
