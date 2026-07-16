/** Mirror of backend/app/schemas/keywords.py (CP12) */

import type { ArticleTextRequest } from "@/types/common";

export type KeywordsRequest = ArticleTextRequest & {
  limit?: number;
};

export type KeywordItem = {
  keyword: string;
  score: number | null;
};

export type KeywordsResponse = {
  keywords: KeywordItem[];
  spacy_model: string;
  original_length: number;
  cleaned_length: number;
  candidate_count: number;
  limit: number;
};
