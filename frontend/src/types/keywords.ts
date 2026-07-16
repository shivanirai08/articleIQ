/** Mirror of backend/app/schemas/keywords.py (CP12) */

import type { ArticleTextRequest } from "@/types/common";

export type KeywordsRequest = ArticleTextRequest;

export type KeywordItem = {
  keyword: string;
  score: number | null;
};

export type KeywordsResponse = {
  keywords: KeywordItem[];
};
