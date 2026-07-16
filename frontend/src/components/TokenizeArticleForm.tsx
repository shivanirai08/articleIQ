"use client";

import { FormEvent, useState } from "react";

import { ApiError, tokenizeArticle } from "@/lib/api";
import type { TokenizeResponse } from "@/types";

const SAMPLE =
  "Apple Inc. announced record quarterly revenue on Tuesday. " +
  "Investors welcomed the news from Cupertino. " +
  "Analysts said the results exceeded expectations across all regions.";

type FormStatus = "idle" | "loading" | "success" | "error";

/** Demonstrates spaCy tokenization + sentence segmentation (Checkpoint 8). */
export function TokenizeArticleForm() {
  const [text, setText] = useState(SAMPLE);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<TokenizeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const data = await tokenizeArticle({ text });
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Tokenize request failed. Is the backend running with spaCy installed?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Checkpoint 8 — spaCy tokenize
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/tokenize</code> runs
        preprocessing then spaCy for sentences, tokens, lemmas, and POS tags.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-28 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Article text for tokenization"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Tokenizing…" : "Tokenize article"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 space-y-4">
          <dl className="grid gap-2 rounded-lg bg-[var(--accent-muted)]/30 p-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--muted)]">Model</dt>
              <dd className="font-medium">{result.spacy_model}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Sentences</dt>
              <dd className="font-medium">{result.sentence_count}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Tokens</dt>
              <dd className="font-medium">
                {result.token_count}
                {result.tokens_truncated ? " (preview capped)" : ""}
              </dd>
            </div>
          </dl>

          <div>
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">Sentences</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {result.sentences.map((sentence) => (
                <li key={sentence.index}>{sentence.text}</li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">
              Token preview (lemma / POS)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.tokens.map((token) => (
                <span
                  key={token.index}
                  className="rounded-md border border-[var(--border)] px-2 py-1 font-mono text-xs"
                  title={`lemma: ${token.lemma} | pos: ${token.pos} | stop: ${token.is_stop}`}
                >
                  {token.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </section>
  );
}
