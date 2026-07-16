/** TypeScript mirror of backend GET /health response (Checkpoint 3–4). */

export type HealthResponse = {
  status: string;
  service: string;
  environment: string;
  gemini_configured: boolean;
};
