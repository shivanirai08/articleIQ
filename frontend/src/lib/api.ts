import { apiBaseUrl } from "@/lib/config";
import type {
  ArticleTextRequest,
  HealthResponse,
  LlmDemoResponse,
  PreprocessResponse,
  TokenizeResponse,
  ValidateArticleResponse,
  SummarizeResponse,
  SentimentResponse,
  KeywordsResponse,
  EntitiesResponse,
} from "@/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await parseJson<{ detail?: string | { msg: string }[] }>(response);
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
        message = body.detail[0].msg;
      }
    } catch {
      // keep default message
    }
    throw new ApiError(message, response.status);
  }
  return parseJson<T>(response);
}

/** GET /health */
export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  return handleResponse<HealthResponse>(response);
}

/** POST /api/v1/validate-article — contract demo (Checkpoint 6) */
export async function validateArticle(
  body: ArticleTextRequest,
): Promise<ValidateArticleResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/validate-article`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<ValidateArticleResponse>(response);
}

/** POST /api/v1/preprocess — NLP cleaning pipeline (Checkpoint 7, O1) */
export async function preprocessArticle(
  body: ArticleTextRequest,
): Promise<PreprocessResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/preprocess`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<PreprocessResponse>(response);
}

/** POST /api/v1/tokenize — spaCy tokenization (Checkpoint 8) */
export async function tokenizeArticle(
  body: ArticleTextRequest,
): Promise<TokenizeResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/tokenize`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<TokenizeResponse>(response);
}

/** POST /api/v1/llm/demo — Claude integration test (Checkpoint 9) */
export async function llmDemo(message: string): Promise<LlmDemoResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/llm/demo`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  return handleResponse<LlmDemoResponse>(response);
}

/** POST /api/v1/summarize — abstractive news summary (Checkpoint 10, O2) */
export async function summarizeArticle(
  body: ArticleTextRequest,
): Promise<SummarizeResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/summarize`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<SummarizeResponse>(response);
}

/** POST /api/v1/sentiment — news sentiment classification (Checkpoint 11, O3) */
export async function analyzeSentiment(
  body: ArticleTextRequest,
): Promise<SentimentResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/sentiment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<SentimentResponse>(response);
}

/** POST /api/v1/keywords — spaCy keyword extraction (Checkpoint 12, O4) */
export async function extractKeywords(
  body: ArticleTextRequest & { limit?: number },
): Promise<KeywordsResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/keywords`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<KeywordsResponse>(response);
}

/** POST /api/v1/entities — spaCy NER (Checkpoint 13, O4) */
export async function extractEntities(
  body: ArticleTextRequest,
): Promise<EntitiesResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/entities`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<EntitiesResponse>(response);
}
