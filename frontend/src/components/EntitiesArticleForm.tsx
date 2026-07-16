"use client";

import { FormEvent, useState } from "react";

import { ApiError, extractEntities } from "@/lib/api";
import type { EntityItem } from "@/types";

const SAMPLE_ARTICLE =
  "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino, California. " +
  "Chief executive Tim Cook told investors that cloud services demand accelerated. " +
  "Analysts at Goldman Sachs raised price targets, citing strong margins across regions.";

const LABEL_STYLES: Record<string, string> = {
  PERSON: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  ORG: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
  GPE: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  DATE: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  MONEY: "bg-yellow-500/15 text-yellow-900 dark:text-yellow-300",
  EVENT: "bg-rose-500/15 text-rose-800 dark:text-rose-300",
};

function labelClass(label: string): string {
  return LABEL_STYLES[label] ?? "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}

type FormStatus = "idle" | "loading" | "success" | "error";

/** Objective O4 — named entity recognition via POST /api/v1/entities */
export function EntitiesArticleForm() {
  const [text, setText] = useState(SAMPLE_ARTICLE);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [result, setResult] = useState<EntityItem[]>([]);
  const [meta, setMeta] = useState<{
    entity_count: number;
    unique_labels: string[];
    spacy_model: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    setResult([]);
    setMeta(null);

    try {
      const data = await extractEntities({ text });
      setResult(data.entities);
      setMeta({
        entity_count: data.entity_count,
        unique_labels: data.unique_labels,
        spacy_model: data.spacy_model,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Entity extraction failed. Is the backend running with spaCy installed?",
      );
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Objective O4 — extract entities (NER)
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        POST <code className="font-mono text-xs">/api/v1/entities</code> runs
        preprocessing + spaCy NER for PERSON, ORG, GPE, DATE, and more.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-36 w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Article text for entity extraction"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Extracting…" : "Extract entities"}
        </button>
      </form>

      {status === "success" && meta && (
        <div className="mt-4 space-y-3">
          {result.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No entities detected in this article.</p>
          ) : (
            <ul className="space-y-2">
              {result.map((entity, index) => (
                <li
                  key={`${entity.start}-${entity.end}-${index}`}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <span className="font-medium">{entity.text}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${labelClass(entity.label)}`}
                  >
                    {entity.label}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    chars {entity.start}–{entity.end}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <dl className="grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
            <div>
              <dt>Entity count / labels</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {meta.entity_count} · {meta.unique_labels.join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt>spaCy model</dt>
              <dd className="font-medium text-[var(--foreground)]">{meta.spacy_model}</dd>
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
