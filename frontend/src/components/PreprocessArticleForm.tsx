"use client";

import { FormEvent, useState } from "react";

import { ApiError, preprocessArticle } from "@/lib/api";
import type { PreprocessResponse } from "@/types";

const MESSY_SAMPLE =
  "<p>Breaking&nbsp;news:</p><p>   Scientists unveiled a solar panel that " +
  "converts sunlight more efficiently.   </p>\n\n\n<p>Analysts said costs " +
  "could fall within five years.</p>";

type FormStatus = "idle" | "loading" | "success" | "error";

/** Demonstrates Objective O1 — NLP preprocessing via POST /api/v1/preprocess */
export function PreprocessArticleForm() {
  const [text, setText] = useState(MESSY_SAMPLE);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<PreprocessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await preprocessArticle({ text });
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Preprocess request failed. Is the backend running?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Objective O1 — preprocess article
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/preprocess</code> strips
        HTML, decodes entities, normalizes Unicode, and collapses whitespace before
        NLP/LLM steps.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-36 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 font-mono text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Raw article text with optional HTML"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Preprocessing…" : "Preprocess text"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 space-y-3">
          <dl className="grid gap-2 rounded-lg bg-[var(--accent-muted)]/30 p-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--muted)]">Original chars</dt>
              <dd className="font-medium">{result.original_character_count}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Cleaned chars</dt>
              <dd className="font-medium">{result.cleaned_character_count}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Words</dt>
              <dd className="font-medium">{result.word_count}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Steps applied</dt>
              <dd className="font-medium">
                {result.transformations_applied.length > 0
                  ? result.transformations_applied.join(", ")
                  : "none (already clean)"}
              </dd>
            </div>
          </dl>
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">
              Cleaned text
            </p>
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm whitespace-pre-wrap">
              {result.cleaned_text}
            </pre>
          </div>
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </section>
  );
}
