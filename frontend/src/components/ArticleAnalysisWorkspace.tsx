"use client";

import { FormEvent, useState } from "react";

import { AnalysisResultsPanel } from "@/components/AnalysisResultsPanel";
import { analyzeArticle, askArticleQuestion, ApiError } from "@/lib/api";
import { SAMPLE_ARTICLE, SAMPLE_QUESTIONS } from "@/lib/sample-article";
import type { AnalyzeResponse, QAResponse } from "@/types";

type LoadState = "idle" | "loading" | "success" | "error";

function Spinner() {
  return (
    <svg className="spinner h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

  function clearArticle() {
    setArticle("");
    setAnalysis(null);
    setAnalyzeState("idle");
    setAnalyzeError(null);
    setQaResult(null);
    setQaState("idle");
    setQaError(null);
  }

  function loadSample() {
    setArticle(SAMPLE_ARTICLE);
    setAnalysis(null);
    setAnalyzeState("idle");
    setAnalyzeError(null);
  }

  const charCount = article.trim().length;
  const canAnalyze = charCount >= 50;
  const canAsk = charCount >= 50;
  const hasResults = analyzeState === "success" && analysis;
  const isAnalyzing = analyzeState === "loading";

  return (
    <div className="space-y-6">
      <section className="panel animate-fade-up-delay p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
              Article
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Paste news text, then run a full analysis.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary text-sm" onClick={loadSample}>
              Sample
            </button>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={clearArticle}
              disabled={!article}
            >
              Clear
            </button>
          </div>
        </div>

        <form onSubmit={onAnalyze} className="space-y-4">
          <textarea
            id="article-text"
            className="field min-h-52 resize-y text-[0.95rem]"
            value={article}
            onChange={(event) => setArticle(event.target.value)}
            placeholder="Paste your news article here…"
            aria-label="Article text"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">
              {charCount} characters
              {!canAnalyze && (
                <span className="ml-2 text-[var(--warn)]">· need at least 50</span>
              )}
            </p>

            <button
              type="submit"
              className="btn-primary min-w-36"
              disabled={isAnalyzing || !canAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <Spinner />
                  Analyzing
                </>
              ) : (
                "Analyze article"
              )}
            </button>
          </div>

          {isAnalyzing && (
            <div
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4"
              role="status"
              aria-live="polite"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--ink)]">Working on your article</span>
                <span className="text-[var(--muted)]">up to ~30s</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--accent-muted)]">
                <div className="loading-bar h-full w-full rounded-full bg-[var(--accent)]" />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Extracting keywords &amp; entities, then generating summary and sentiment.
              </p>
            </div>
          )}

          {analyzeState === "error" && analyzeError && (
            <p
              className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]"
              role="alert"
            >
              {analyzeError}
            </p>
          )}
        </form>
      </section>

      {hasResults && (
        <section className="animate-fade-up space-y-4">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
                Insights
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Summary, tone, keywords, and named entities from this article.
              </p>
            </div>
            {analysis.total_latency_ms > 0 && (
              <p className="text-xs text-[var(--muted)]">
                {(analysis.total_latency_ms / 1000).toFixed(1)}s
              </p>
            )}
          </div>
          <AnalysisResultsPanel result={analysis} />
        </section>
      )}

      <section className="panel animate-fade-up-delay-2 p-5 sm:p-7">
        <div className="mb-4">
          <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
            Ask about this article
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Answers stay grounded in the text — if it isn&apos;t there, we say so.
          </p>
        </div>

        <form onSubmit={onAskQuestion} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sample) => (
              <button
                key={sample}
                type="button"
                className={`chip ${question === sample ? "chip-active" : ""}`}
                disabled={!canAsk || qaState === "loading"}
                onClick={() => setQuestion(sample)}
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
              className="field flex-1 py-3"
              placeholder="What would you like to know?"
              aria-label="Question"
            />
            <button
              type="submit"
              className="btn-primary sm:min-w-28"
              disabled={!canAsk || qaState === "loading" || !question.trim()}
            >
              {qaState === "loading" ? (
                <>
                  <Spinner />
                  Asking
                </>
              ) : (
                "Ask"
              )}
            </button>
          </div>
        </form>

        {qaState === "error" && qaError && (
          <p
            className="mt-4 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]"
            role="alert"
          >
            {qaError}
          </p>
        )}

        {qaState === "success" && qaResult && (
          <div className="animate-fade-up mt-5 border-t border-[var(--border)] pt-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                  qaResult.grounded
                    ? "bg-[var(--success-bg)] text-[var(--success)]"
                    : "bg-[var(--warn-bg)] text-[var(--warn)]"
                }`}
              >
                {qaResult.grounded ? "Grounded" : "Not in article"}
              </span>
            </div>
            <p className="text-base leading-relaxed text-[var(--ink)]">{qaResult.answer}</p>
          </div>
        )}
      </section>
    </div>
  );
}
