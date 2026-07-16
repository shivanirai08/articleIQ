/** Mirror of backend/app/schemas/sentiment.py (CP11) */

import type { ArticleTextRequest } from "@/types/common";

export type SentimentLabel = "positive" | "negative" | "neutral" | "mixed";

export type SentimentRequest = ArticleTextRequest;

export type SentimentResponse = {
  label: SentimentLabel;
  confidence: number | null;
  rationale: string;
  original_length: number;
  cleaned_length: number;
  model: string;
  latency_ms: number;
  prompt_tokens: number | null;
  output_tokens: number | null;
};
