/** Shared API contracts — mirror of backend/app/schemas/common.py */

export type ArticleTextRequest = {
  text: string;
};

export type ValidateArticleResponse = {
  valid: boolean;
  character_count: number;
  word_count: number;
};

export type ErrorResponse = {
  detail: string;
};
