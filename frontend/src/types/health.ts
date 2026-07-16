/** Mirror of backend/app/schemas/system.py */

export type HealthResponse = {
  status: "ok";
  service: string;
  environment: "development" | "staging" | "production";
  llm_configured: boolean;
};
