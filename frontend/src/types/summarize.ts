/** Mirror of backend/app/schemas/summarize.py (CP10 — Objective O2) */

import type { ArticleTextRequest } from "@/types/common";

export type SummarizeRequest = ArticleTextRequest;

export type SummarizeResponse = {
  summary: string;
  original_length: number;
  cleaned_length: number;
  summary_length: number;
  model: string;
  latency_ms: number;
  prompt_tokens: number | null;
  output_tokens: number | null;
};
