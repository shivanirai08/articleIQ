/** Mirror of backend/app/schemas/preprocess.py (CP7 — Objective O1) */

import type { ArticleTextRequest } from "@/types/common";

export type PreprocessRequest = ArticleTextRequest;

export type PreprocessResponse = {
  cleaned_text: string;
  original_character_count: number;
  cleaned_character_count: number;
  word_count: number;
  transformations_applied: string[];
};
