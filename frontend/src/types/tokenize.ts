/** Mirror of backend/app/schemas/tokenize.py (CP8) */

import type { ArticleTextRequest } from "@/types/common";

export type TokenizeRequest = ArticleTextRequest;

export type TokenItem = {
  index: number;
  text: string;
  lemma: string;
  pos: string;
  is_alpha: boolean;
  is_stop: boolean;
};

export type SentenceItem = {
  index: number;
  text: string;
  start_char: number;
  end_char: number;
};

export type TokenizeResponse = {
  spacy_model: string;
  cleaned_character_count: number;
  token_count: number;
  sentence_count: number;
  sentences: SentenceItem[];
  tokens: TokenItem[];
  tokens_truncated: boolean;
};
