import type { SentimentLabel } from "@/types";

export const SENTIMENT_STYLES: Record<SentimentLabel, string> = {
  positive: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  negative: "bg-red-500/15 text-red-700 dark:text-red-300",
  neutral: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  mixed: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
};

export const ENTITY_LABEL_STYLES: Record<string, string> = {
  PERSON: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  ORG: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
  GPE: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  DATE: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  MONEY: "bg-yellow-500/15 text-yellow-900 dark:text-yellow-300",
};

export function entityLabelClass(label: string): string {
  return ENTITY_LABEL_STYLES[label] ?? "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}
