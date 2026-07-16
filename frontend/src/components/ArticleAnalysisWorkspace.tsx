"use client";

import { FormEvent, useState } from "react";

import { AnalysisResultsPanel } from "@/components/AnalysisResultsPanel";
import { analyzeArticle, askArticleQuestion, ApiError } from "@/lib/api";
import { SAMPLE_ARTICLE, SAMPLE_QUESTIONS } from "@/lib/sample-article";
import type { AnalyzeResponse, QAResponse } from "@/types";

type LoadState = "idle" | "loading" | "success" | "error";

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
        error instanceof ApiError ? error.message : "Analysis failed. Try again.",
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
      setQaError(error instanceof ApiError ? error.message : "Could not answer that question.");
    }
  }

  const canAsk = article.trim().length >= 50;
  const hasResults = analyzeState === "success" && analysis;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <form onSubmit={onAnalyze} className="space-y-4">
          <textarea
            id="article-text"
            className="min-h-48 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-relaxed outline-none ring-[var(--accent)] focus:ring-2"
            value={article}
            onChange={(event) => setArticle(event.target.value)}
            placeholder="Paste your news article here…"
            aria-label="Article text"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={analyzeState === "loading" || article.trim().length < 50}
              className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzeState === "loading" ? "Analyzing…" : "Analyze"}
            </button>
            {article.trim().length < 50 && (
              <span className="text-xs text-[var(--muted)]">Minimum 50 characters</span>
            )}
          </div>

          {analyzeState === "loading" && (
            <p className="text-sm text-[var(--muted)]" role="status">
              This may take up to 30 seconds…
            </p>
          )}

          {analyzeState === "error" && analyzeError && (
            <p className="text-sm text-red-600 dark:text-red-400">{analyzeError}</p>
          )}
        </form>
      </section>

      {hasResults && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <AnalysisResultsPanel result={analysis} />
        </section>
      )}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-sm font-semibold">Ask a question</h2>

        <form onSubmit={onAskQuestion} className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sample) => (
              <button
                key={sample}
                type="button"
                disabled={!canAsk || qaState === "loading"}
                onClick={() => setQuestion(sample)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-40"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={!canAsk || qaState === "loading"}
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-50"
              placeholder="What would you like to know?"
              aria-label="Question"
            />
            <button
              type="submit"
              disabled={!canAsk || qaState === "loading" || !question.trim()}
              className="rounded-xl border border-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-muted)]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {qaState === "loading" ? "…" : "Ask"}
            </button>
          </div>
        </form>

        {qaState === "error" && qaError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{qaError}</p>
        )}

        {qaState === "success" && qaResult && (
          <div className="mt-4 rounded-xl bg-[var(--accent-muted)]/20 p-4">
            {!qaResult.grounded && (
              <p className="mb-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                Not found in article
              </p>
            )}
            <p className="text-sm leading-relaxed">{qaResult.answer}</p>
          </div>
        )}
      </section>
    </div>
  );
}
