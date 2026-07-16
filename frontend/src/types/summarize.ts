/** Mirror of backend/app/schemas/summarize.py (CP10) */

import type { ArticleTextRequest } from "@/types/common";

export type SummarizeRequest = ArticleTextRequest;

export type SummarizeResponse = {
  summary: string;
  original_length: number;
  summary_length: number;
};
