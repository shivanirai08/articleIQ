/** Mirror of backend/app/schemas/qa.py (CP14) */

import type { ArticleTextRequest } from "@/types/common";

export type QARequest = ArticleTextRequest & {
  question: string;
};

export type QAResponse = {
  answer: string;
  grounded: boolean;
  question: string;
  original_length: number;
  cleaned_length: number;
  model: string;
  latency_ms: number;
  prompt_tokens: number | null;
  output_tokens: number | null;
};
