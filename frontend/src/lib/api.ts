import { apiBaseUrl } from "@/lib/config";
import type {
  ArticleTextRequest,
  HealthResponse,
  ValidateArticleResponse,
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
