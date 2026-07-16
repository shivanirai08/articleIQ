"use client";

import { FormEvent, useState } from "react";

import { AnalysisResultsPanel } from "@/components/AnalysisResultsPanel";
import { analyzeArticle, askArticleQuestion, ApiError } from "@/lib/api";
import { SAMPLE_ARTICLE, SAMPLE_QUESTIONS } from "@/lib/sample-article";
import type { AnalyzeResponse, QAResponse } from "@/types";

type LoadState = "idle" | "loading" | "success" | "error";

/** Objective O6 — unified article analysis + Q&A workspace (Checkpoint 16). */
export function ArticleAnalysisWorkspace() {
  const [article, setArticle] = useState(SAMPLE_ARTICLE);
  const [analyzeState, setAnalyzeState] = useState<LoadState>("idle");
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [question, setQuestion] = useState<string>(SAMPLE_QUESTIONS[0]);
  const [qaState, setQaState] = useState<LoadState>("idle");
  const [qaResult, setQaResult] = useState<QAResponse | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  async function onAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalyzeState("loading");
    setAnalyzeError(null);
    setAnalysis(null);
    setQaResult(null);
    setQaState("idle");
    setQaError(null);

    try {
      const data = await analyzeArticle({ text: article, keyword_limit: 10 });
      setAnalysis(data);
      setAnalyzeState("success");
    } catch (error) {
      setAnalyzeState("error");
      setAnalyzeError(
        error instanceof ApiError
          ? error.message
          : "Analysis failed. Is the backend running on port 8000?",
      );
    }
  }

  async function onAskQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    setQaState("loading");
    setQaError(null);
    setQaResult(null);

    try {
      const data = await askArticleQuestion({ text: article, question: question.trim() });
      setQaResult(data);
      setQaState("success");
    } catch (error) {
      setQaState("error");
      setQaError(
        error instanceof ApiError
          ? error.message
          : "Q&A failed. Is GROK_API_KEY configured on the backend?",
      );
    }
  }

  const wordCount = article.trim() ? article.trim().split(/\s+/).length : 0;
  const canAsk = analyzeState === "success" && article.trim().length >= 50;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Analyze a news article</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              One article → summary, sentiment, keywords, and entities. Then ask follow-up
              questions grounded in the same text.
            </p>
          </div>
          <span className="rounded-full bg-[var(--accent-muted)]/50 px-3 py-1 text-xs font-medium text-[var(--muted)]">
            O2 · O3 · O4 · O5 · O6
          </span>
        </div>

        <form onSubmit={onAnalyze} className="mt-5 space-y-4">
          <div>
            <label htmlFor="article-text" className="text-sm font-medium">
              Article text
            </label>
            <textarea
              id="article-text"
              className="mt-2 min-h-44 w-full rounded-xl border border-[var(--border)] bg-transparent p-4 text-sm leading-relaxed"
              value={article}
              onChange={(event) => setArticle(event.target.value)}
              placeholder="Paste a news article here (minimum 50 characters)…"
              aria-describedby="article-meta"
            />
            <p id="article-meta" className="mt-2 text-xs text-[var(--muted)]">
              {article.length} characters · {wordCount} words
            </p>
          </div>

          <button
            type="submit"
            disabled={analyzeState === "loading" || article.trim().length < 50}
            className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzeState === "loading" ? "Analyzing article…" : "Analyze article"}
          </button>

          {analyzeState === "loading" && (
            <div
              className="rounded-xl border border-[var(--border)] bg-[var(--accent-muted)]/20 p-4 text-sm"
              role="status"
              aria-live="polite"
            >
              <p className="font-medium">Running NLP and LLM analysis</p>
              <p className="mt-1 text-[var(--muted)]">
                spaCy extracts keywords and entities first, then the LLM generates summary
                and sentiment. This usually takes 10–30 seconds — please wait.
              </p>
            </div>
          )}

          {analyzeState === "error" && analyzeError && (
            <p className="text-sm text-red-600 dark:text-red-400">{analyzeError}</p>
          )}
        </form>
      </section>

      {analyzeState === "success" && analysis && (
        <section className="rounded-2xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold">Analysis results</h2>
          <div className="mt-4">
            <AnalysisResultsPanel result={analysis} />
          </div>
        </section>
      )}

      <section
        className={`rounded-2xl border p-6 ${
          canAsk ? "border-[var(--border)]" : "border-dashed border-[var(--border)] opacity-80"
        }`}
      >
        <h2 className="text-lg font-semibold">Ask about this article</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Grounded Q&amp;A uses the same article text. The model refuses when the answer is
          not in the article.
        </p>

        {!canAsk && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Run analysis first (or ensure the article is at least 50 characters).
          </p>
        )}

        <form onSubmit={onAskQuestion} className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sample) => (
              <button
                key={sample}
                type="button"
                disabled={!canAsk || qaState === "loading"}
                onClick={() => setQuestion(sample)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-50"
              >
                {sample}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={!canAsk || qaState === "loading"}
            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm disabled:opacity-60"
            placeholder="Ask a question about the article…"
            aria-label="Question about the article"
          />

          <button
            type="submit"
            disabled={!canAsk || qaState === "loading" || !question.trim()}
            className="rounded-xl border border-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {qaState === "loading" ? "Thinking…" : "Ask question"}
          </button>
        </form>

        {qaState === "loading" && (
          <p className="mt-3 text-sm text-[var(--muted)]" role="status">
            Querying the LLM with the article context…
          </p>
        )}

        {qaState === "error" && qaError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{qaError}</p>
        )}

        {qaState === "success" && qaResult && (
          <div className="mt-4 space-y-3 rounded-xl bg-[var(--accent-muted)]/20 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                  qaResult.grounded
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                }`}
              >
                {qaResult.grounded ? "Grounded in article" : "Not grounded"}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {qaResult.model} · {qaResult.latency_ms} ms
              </span>
            </div>
            <p className="text-sm leading-relaxed">{qaResult.answer}</p>
          </div>
        )}
      </section>
    </div>
  );
}
