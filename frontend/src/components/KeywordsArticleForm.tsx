"use client";

import { FormEvent, useState } from "react";

import { ApiError, extractKeywords } from "@/lib/api";
import type { KeywordsResponse } from "@/types";

const SAMPLE_ARTICLE =
  "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino. " +
  "Investors welcomed the earnings report as cloud services demand accelerated. " +
  "Several Wall Street analysts raised price targets, citing strong margins and " +
  "resilient enterprise spending across North America and Europe.";

type FormStatus = "idle" | "loading" | "success" | "error";

/** Objective O4 — keyword extraction via POST /api/v1/keywords */
export function KeywordsArticleForm() {
  const [text, setText] = useState(SAMPLE_ARTICLE);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<KeywordsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await extractKeywords({ text, limit });
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Keyword extraction failed. Is the backend running with spaCy installed?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Objective O4 — extract keywords
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/keywords</code> runs
        preprocessing + spaCy noun chunks with term-frequency ranking (no LLM).
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-36 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Article text for keyword extraction"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Top
          <input
            type="number"
            min={1}
            max={30}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="w-16 rounded border border-[var(--border)] bg-transparent px-2 py-1 text-sm"
            aria-label="Keyword limit"
          />
          keywords
        </label>
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Extracting…" : "Extract keywords"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 space-y-3">
          <ul className="flex flex-wrap gap-2">
            {result.keywords.map((item) => (
              <li
                key={item.keyword}
                className="rounded-full bg-[var(--accent-muted)]/40 px-3 py-1 text-xs font-medium"
                title={item.score != null ? `Score: ${item.score.toFixed(2)}` : undefined}
              >
                {item.keyword}
                {item.score != null && (
                  <span className="ml-1.5 text-[var(--muted)]">
                    {(item.score * 100).toFixed(0)}%
                  </span>
                )}
              </li>
            ))}
          </ul>
          <dl className="grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
            <div>
              <dt>Candidates / returned / limit</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {result.candidate_count} / {result.keywords.length} / {result.limit}
              </dd>
            </div>
            <div>
              <dt>spaCy model</dt>
              <dd className="font-medium text-[var(--foreground)]">{result.spacy_model}</dd>
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
