import type { AnalyzeResponse } from "@/types";

import { entityLabelClass, SENTIMENT_STYLES } from "@/lib/analysis-styles";

type AnalysisResultsPanelProps = {
  result: AnalyzeResponse;
};

/** Renders orchestrated analysis sections from POST /api/v1/analyze. */
export function AnalysisResultsPanel({ result }: AnalysisResultsPanelProps) {
  return (
    <div className="space-y-4">
      {result.errors.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            Partial results — some sections failed
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-[var(--muted)]">
            {result.errors.map((item) => (
              <li key={item.section}>
                {item.section}: {item.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {result.summary ? (
          <article className="rounded-xl border border-[var(--border)] bg-[var(--accent-muted)]/20 p-4 lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Summary
            </h3>
            <p className="mt-2 text-sm leading-relaxed">{result.summary.summary}</p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {result.summary.model} · {result.summary.latency_ms} ms
            </p>
          </article>
        ) : (
          <article className="rounded-xl border border-dashed border-[var(--border)] p-4 lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase text-[var(--muted)]">Summary</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">Unavailable — check errors above.</p>
          </article>
        )}

        {result.sentiment ? (
          <article className="rounded-xl border border-[var(--border)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Sentiment
            </h3>
            <div className="mt-3 space-y-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${SENTIMENT_STYLES[result.sentiment.label]}`}
              >
                {result.sentiment.label}
              </span>
              {result.sentiment.confidence != null && (
                <p className="text-xs text-[var(--muted)]">
                  Confidence: {(result.sentiment.confidence * 100).toFixed(0)}%
                </p>
              )}
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {result.sentiment.rationale}
              </p>
            </div>
          </article>
        ) : (
          <article className="rounded-xl border border-dashed border-[var(--border)] p-4">
            <h3 className="text-xs font-semibold uppercase text-[var(--muted)]">Sentiment</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">Unavailable.</p>
          </article>
        )}

        {result.keywords && result.keywords.keywords.length > 0 ? (
          <article className="rounded-xl border border-[var(--border)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Keywords
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.keywords.keywords.map((item) => (
                <li
                  key={item.keyword}
                  className="rounded-full bg-[var(--accent-muted)]/50 px-3 py-1 text-xs font-medium"
                  title={item.score != null ? `Score: ${item.score.toFixed(2)}` : undefined}
                >
                  {item.keyword}
                </li>
              ))}
            </ul>
          </article>
        ) : (
          <article className="rounded-xl border border-dashed border-[var(--border)] p-4">
            <h3 className="text-xs font-semibold uppercase text-[var(--muted)]">Keywords</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">No keywords extracted.</p>
          </article>
        )}

        {result.entities && result.entities.entities.length > 0 ? (
          <article className="rounded-xl border border-[var(--border)] p-4 lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Named entities
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.entities.entities.map((entity, index) => (
                <li
                  key={`${entity.start}-${entity.end}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <span className="font-medium">{entity.text}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${entityLabelClass(entity.label)}`}
                  >
                    {entity.label}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ) : (
          <article className="rounded-xl border border-dashed border-[var(--border)] p-4 lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase text-[var(--muted)]">
              Named entities
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">No entities detected.</p>
          </article>
        )}
      </div>

      <p className="text-xs text-[var(--muted)]">
        Total analysis time: {result.total_latency_ms} ms
      </p>
    </div>
  );
}
