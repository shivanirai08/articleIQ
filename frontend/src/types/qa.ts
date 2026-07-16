/** Mirror of backend/app/schemas/qa.py (CP14) */

import type { ArticleTextRequest } from "@/types/common";

export type QARequest = ArticleTextRequest & {
  question: string;
};

export type QAResponse = {
  answer: string;
  grounded: boolean;
};
