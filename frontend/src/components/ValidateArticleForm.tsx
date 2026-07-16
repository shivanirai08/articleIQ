"use client";

import { FormEvent, useState } from "react";

import { ApiError, validateArticle } from "@/lib/api";
import type { ValidateArticleResponse } from "@/types";

const SAMPLE_TEXT =
  "Researchers unveiled a new solar panel design that converts sunlight more " +
  "efficiently than previous models. The team said the innovation could lower " +
  "electricity costs for households within five years. Energy analysts called " +
  "the announcement a significant step toward cleaner power.";

type FormStatus = "idle" | "loading" | "success" | "error";

/** Demonstrates POST + shared ArticleTextRequest contract (Checkpoint 6). */
export function ValidateArticleForm() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<ValidateArticleResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await validateArticle({ text });
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Validation request failed. Is the backend running?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Contract demo — validate article
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/validate-article</code>{" "}
        with <code className="font-mono text-xs">ArticleTextRequest</code>. Text
        must be 50–50,000 characters (Pydantic enforces this → HTTP 422 if not).
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-32 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Article text"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Validating…" : "Validate article"}
        </button>
      </form>

      {status === "success" && result && (
        <dl className="mt-4 grid gap-2 rounded-lg bg-[var(--accent-muted)]/30 p-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--muted)]">Valid</dt>
            <dd className="font-medium">{result.valid ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Characters</dt>
            <dd className="font-medium">{result.character_count}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Words</dt>
            <dd className="font-medium">{result.word_count}</dd>
          </div>
        </dl>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </section>
  );
}
