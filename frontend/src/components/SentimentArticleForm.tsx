"use client";

import { FormEvent, useState } from "react";

import { analyzeSentiment, ApiError } from "@/lib/api";
import type { SentimentLabel, SentimentResponse } from "@/types";

const SAMPLE_POSITIVE =
  "Global markets climbed on Tuesday after TechCorp reported quarterly earnings " +
  "that beat analyst expectations. The company said revenue rose eighteen percent " +
  "year over year, driven by strong cloud services demand. Several Wall Street firms " +
  "raised their price targets, citing resilient enterprise spending and improved margins.";

const LABEL_STYLES: Record<SentimentLabel, string> = {
  positive: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  negative: "bg-red-500/15 text-red-700 dark:text-red-300",
  neutral: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  mixed: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
};

type FormStatus = "idle" | "loading" | "success" | "error";

/** Objective O3 — sentiment classification via POST /api/v1/sentiment */
export function SentimentArticleForm() {
  const [text, setText] = useState(SAMPLE_POSITIVE);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<SentimentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await analyzeSentiment({ text });
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Sentiment analysis failed. Is the backend running with GROK_API_KEY?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Objective O3 — analyze sentiment
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/sentiment</code> runs
        preprocessing + LLM structured JSON classification with rationale.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-36 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Article text for sentiment analysis"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Analyzing…" : "Analyze sentiment"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${LABEL_STYLES[result.label]}`}
            >
              {result.label}
            </span>
            {result.confidence != null && (
              <span className="text-xs text-[var(--muted)]">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="rounded-lg bg-[var(--accent-muted)]/30 p-4">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">Rationale</p>
            <p className="mt-2 text-sm leading-relaxed">{result.rationale}</p>
          </div>
          <dl className="grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
            <div>
              <dt>Original / cleaned chars</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {result.original_length} / {result.cleaned_length}
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
