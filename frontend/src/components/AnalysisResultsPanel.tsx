import type { AnalyzeResponse } from "@/types";

import { entityLabelClass, SENTIMENT_STYLES } from "@/lib/analysis-styles";

type AnalysisResultsPanelProps = {
  result: AnalyzeResponse;
};

export function AnalysisResultsPanel({ result }: AnalysisResultsPanelProps) {
  return (
    <div className="space-y-4">
      {result.errors.length > 0 && (
        <div className="rounded-xl border border-[var(--warn)]/25 bg-[var(--warn-bg)] px-4 py-3 text-sm text-[var(--warn)]">
          Some sections could not be generated. Available insights are shown below.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        {result.summary && (
          <article className="panel p-5 sm:p-6 lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Summary
            </p>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-[var(--ink)]">
              {result.summary.summary}
            </p>
          </article>
        )}

        {result.sentiment && (
          <article className="panel p-5 sm:p-6 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Sentiment
            </p>
            <div className="mt-4">
              <span
                className={`inline-block rounded-lg px-3 py-1.5 text-sm font-semibold capitalize ${SENTIMENT_STYLES[result.sentiment.label]}`}
              >
                {result.sentiment.label}
              </span>
              {result.sentiment.confidence != null && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Confidence {(result.sentiment.confidence * 100).toFixed(0)}%
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {result.sentiment.rationale}
              </p>
            </div>
          </article>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.keywords && result.keywords.keywords.length > 0 && (
          <article className="panel p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Keywords
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {result.keywords.keywords.map((item) => (
                <li
                  key={item.keyword}
                  className="rounded-lg bg-[var(--accent-muted)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                >
                  {item.keyword}
                </li>
              ))}
            </ul>
          </article>
        )}

        {result.entities && result.entities.entities.length > 0 && (
          <article className="panel p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Entities
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {result.entities.entities.map((entity, index) => (
                <li
                  key={`${entity.start}-${entity.end}-${index}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-sm"
                >
                  <span className="font-medium text-[var(--ink)]">{entity.text}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${entityLabelClass(entity.label)}`}
                  >
                    {entity.label}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </div>
  );
}
