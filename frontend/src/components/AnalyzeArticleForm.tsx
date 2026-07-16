"use client";

import { FormEvent, useState } from "react";

import { analyzeArticle, ApiError } from "@/lib/api";
import type { AnalyzeResponse, SentimentLabel } from "@/types";

const SAMPLE_ARTICLE =
  "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino, California. " +
  "The company said revenue rose eighteen percent year over year, driven by cloud services. " +
  "Chief executive Tim Cook told investors that operating margins improved significantly.";

const SENTIMENT_STYLES: Record<SentimentLabel, string> = {
  positive: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  negative: "bg-red-500/15 text-red-700 dark:text-red-300",
  neutral: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  mixed: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
};

type FormStatus = "idle" | "loading" | "success" | "error";

/** Checkpoint 15 — one-call full analysis via POST /api/v1/analyze */
export function AnalyzeArticleForm() {
  const [text, setText] = useState(SAMPLE_ARTICLE);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await analyzeArticle({ text, keyword_limit: 8 });
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Full analysis failed. Is the backend running?",
      );
    }
  }

  return (
    <section className="rounded-xl border-2 border-[var(--accent)]/40 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
        Checkpoint 15 — analyze full article
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/analyze</code> orchestrates
        summary, sentiment, keywords, and entities in one request (partial errors
        supported).
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-36 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Article text for full analysis"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Analyzing…" : "Analyze full article"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 space-y-4">
          {result.errors.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Partial results — some sections failed
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-[var(--muted)]">
                {result.errors.map((item) => (
                  <li key={item.section}>
                    {item.section}: {item.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.summary && (
            <div className="rounded-lg bg-[var(--accent-muted)]/30 p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">Summary</p>
              <p className="mt-2 text-sm leading-relaxed">{result.summary.summary}</p>
            </div>
          )}

          {result.sentiment && (
            <div className="space-y-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${SENTIMENT_STYLES[result.sentiment.label]}`}
              >
                {result.sentiment.label}
              </span>
              <p className="text-sm text-[var(--muted)]">{result.sentiment.rationale}</p>
            </div>
          )}

          {result.keywords && result.keywords.keywords.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">Keywords</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.keywords.keywords.map((item) => (
                  <li
                    key={item.keyword}
                    className="rounded-full bg-[var(--accent-muted)]/40 px-3 py-1 text-xs font-medium"
                  >
                    {item.keyword}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.entities && result.entities.entities.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">Entities</p>
              <ul className="mt-2 space-y-1 text-sm">
                {result.entities.entities.map((entity, index) => (
                  <li key={`${entity.start}-${index}`}>
                    <span className="font-medium">{entity.text}</span>{" "}
                    <span className="text-xs uppercase text-[var(--muted)]">{entity.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-[var(--muted)]">
            Total orchestration time: {result.total_latency_ms} ms
          </p>
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </section>
  );
}
