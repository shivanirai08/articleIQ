/** Mirror of backend/app/schemas/sentiment.py (CP11) */

import type { ArticleTextRequest } from "@/types/common";

export type SentimentLabel = "positive" | "negative" | "neutral" | "mixed";

export type SentimentRequest = ArticleTextRequest;

export type SentimentResponse = {
  label: SentimentLabel;
  confidence: number | null;
  rationale: string;
};
