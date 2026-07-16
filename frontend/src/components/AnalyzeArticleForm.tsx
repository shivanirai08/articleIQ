"use client";

import { FormEvent, useState } from "react";

import { AnalysisResultsPanel } from "@/components/AnalysisResultsPanel";
import { analyzeArticle, ApiError } from "@/lib/api";
import { SAMPLE_ARTICLE } from "@/lib/sample-article";
import type { AnalyzeResponse } from "@/types";

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
        <div className="mt-4">
          <AnalysisResultsPanel result={result} />
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </section>
  );
}
