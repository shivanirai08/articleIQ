import type { SentimentLabel } from "@/types";

export const SENTIMENT_STYLES: Record<SentimentLabel, string> = {
  positive: "bg-[var(--success-bg)] text-[var(--success)]",
  negative: "bg-[var(--danger-bg)] text-[var(--danger)]",
  neutral: "bg-[var(--accent-muted)] text-[var(--muted)]",
  mixed: "bg-[var(--warn-bg)] text-[var(--warn)]",
};

export const ENTITY_LABEL_STYLES: Record<string, string> = {
  PERSON: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  ORG: "bg-teal-500/15 text-teal-800 dark:text-teal-300",
  GPE: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  DATE: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  MONEY: "bg-lime-500/15 text-lime-900 dark:text-lime-300",
};

export function entityLabelClass(label: string): string {
  return ENTITY_LABEL_STYLES[label] ?? "bg-[var(--accent-muted)] text-[var(--muted)]";
}
