/** Mirror of backend/app/schemas/analyze.py (CP15) */

import type { ArticleTextRequest } from "@/types/common";
import type { EntitiesResponse } from "@/types/entities";
import type { KeywordsResponse } from "@/types/keywords";
import type { SentimentResponse } from "@/types/sentiment";
import type { SummarizeResponse } from "@/types/summarize";

export type AnalyzeRequest = ArticleTextRequest;

export type AnalyzeResponse = {
  summary: SummarizeResponse;
  sentiment: SentimentResponse;
  keywords: KeywordsResponse;
  entities: EntitiesResponse;
};
