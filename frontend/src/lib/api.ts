import { apiBaseUrl } from "@/lib/config";
import type { HealthResponse } from "@/types/health";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Fetch backend health — first cross-stack integration test (CP5). */
export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(`Health check failed (${response.status})`, response.status);
  }

  return response.json() as Promise<HealthResponse>;
}
