"use client";

import { FormEvent, useState } from "react";

import { askArticleQuestion, ApiError } from "@/lib/api";
import type { QAResponse } from "@/types";

const SAMPLE_ARTICLE =
  "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino. " +
  "The company said revenue rose eighteen percent year over year, driven by " +
  "strong cloud services demand. Chief executive Tim Cook told investors that " +
  "operating margins improved following a year-long efficiency program.";

const SAMPLE_QUESTION = "How much did revenue grow year over year?";

type FormStatus = "idle" | "loading" | "success" | "error";

/** Objective O5 — grounded Q&A via POST /api/v1/qa */
export function QAArticleForm() {
  const [text, setText] = useState(SAMPLE_ARTICLE);
  const [question, setQuestion] = useState(SAMPLE_QUESTION);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<QAResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await askArticleQuestion({ text, question });
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Q&A failed. Is the backend running with GROK_API_KEY?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Objective O5 — ask about the article
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/qa</code> runs
        preprocessing + grounded LLM Q&amp;A with refusal when the article lacks
        evidence.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-36 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Article text for Q&A"
        />
        <input
          type="text"
          className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          aria-label="Question about the article"
          placeholder="Your question…"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Thinking…" : "Ask question"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                result.grounded
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
              }`}
            >
              {result.grounded ? "Grounded in article" : "Not grounded"}
            </span>
          </div>
          <div className="rounded-lg bg-[var(--accent-muted)]/30 p-4">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">Answer</p>
            <p className="mt-2 text-sm leading-relaxed">{result.answer}</p>
          </div>
          <dl className="grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
            <div>
              <dt>Question</dt>
              <dd className="font-medium text-[var(--foreground)]">{result.question}</dd>
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
