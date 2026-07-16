"use client";

import { FormEvent, useState } from "react";

import { ApiError, summarizeArticle } from "@/lib/api";
import type { SummarizeResponse } from "@/types";

const SAMPLE_ARTICLE =
  "Global markets climbed on Tuesday after TechCorp reported quarterly earnings " +
  "that beat analyst expectations. The company said revenue rose eighteen percent " +
  "year over year, driven by strong cloud services demand in North America and Europe. " +
  "Chief executive Maria Chen told investors that operating margins improved following " +
  "a year-long efficiency program. Several Wall Street firms raised their price targets " +
  "for the stock, citing resilient enterprise spending despite broader economic uncertainty.";

type FormStatus = "idle" | "loading" | "success" | "error";

/** Objective O2 — abstractive summarization via POST /api/v1/summarize */
export function SummarizeArticleForm() {
  const [text, setText] = useState(SAMPLE_ARTICLE);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<SummarizeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await summarizeArticle({ text });
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Summarization failed. Is the backend running with GROK_API_KEY?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Objective O2 — summarize article
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/summarize</code> runs
        preprocessing + LLM abstractive summarization with prompt engineering.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-36 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Article text to summarize"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Summarizing…" : "Summarize"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-[var(--accent-muted)]/30 p-4">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">Summary</p>
            <p className="mt-2 text-sm leading-relaxed">{result.summary}</p>
          </div>
          <dl className="grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
            <div>
              <dt>Original / cleaned / summary chars</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {result.original_length} / {result.cleaned_length} / {result.summary_length}
              </dd>
            </div>
            <div>
              <dt>Model / latency</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {result.model} · {result.latency_ms} ms
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
