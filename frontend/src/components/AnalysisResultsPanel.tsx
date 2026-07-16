import type { AnalyzeResponse } from "@/types";

import { entityLabelClass, SENTIMENT_STYLES } from "@/lib/analysis-styles";

type AnalysisResultsPanelProps = {
  result: AnalyzeResponse;
};

export function AnalysisResultsPanel({ result }: AnalysisResultsPanelProps) {
  return (
    <div className="space-y-4">
      {result.errors.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Some results could not be generated. NLP sections may still be available below.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {result.summary && (
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold">Summary</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {result.summary.summary}
            </p>
          </article>
        )}

        {result.sentiment && (
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-sm font-semibold">Sentiment</h3>
            <div className="mt-3 space-y-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${SENTIMENT_STYLES[result.sentiment.label]}`}
              >
                {result.sentiment.label}
              </span>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {result.sentiment.rationale}
              </p>
            </div>
          </article>
        )}

        {result.keywords && result.keywords.keywords.length > 0 && (
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-sm font-semibold">Keywords</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.keywords.keywords.map((item) => (
                <li
                  key={item.keyword}
                  className="rounded-full bg-[var(--accent-muted)]/40 px-3 py-1 text-xs font-medium"
                >
                  {item.keyword}
                </li>
              ))}
            </ul>
          </article>
        )}

        {result.entities && result.entities.entities.length > 0 && (
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold">People, places &amp; organizations</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.entities.entities.map((entity, index) => (
                <li
                  key={`${entity.start}-${entity.end}-${index}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm"
                >
                  <span>{entity.text}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${entityLabelClass(entity.label)}`}
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
