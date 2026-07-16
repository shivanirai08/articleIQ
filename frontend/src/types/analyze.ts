/** Mirror of backend/app/schemas/analyze.py (CP15) */

import type { ArticleTextRequest } from "@/types/common";
import type { EntitiesResponse } from "@/types/entities";
import type { KeywordsResponse } from "@/types/keywords";
import type { SentimentResponse } from "@/types/sentiment";
import type { SummarizeResponse } from "@/types/summarize";

export type AnalyzeSection = "summary" | "sentiment" | "keywords" | "entities";

export type AnalyzeRequest = ArticleTextRequest & {
  keyword_limit?: number;
};

export type AnalyzeSectionError = {
  section: AnalyzeSection;
  detail: string;
};

export type AnalyzeResponse = {
  summary: SummarizeResponse | null;
  sentiment: SentimentResponse | null;
  keywords: KeywordsResponse | null;
  entities: EntitiesResponse | null;
  errors: AnalyzeSectionError[];
  total_latency_ms: number;
};
