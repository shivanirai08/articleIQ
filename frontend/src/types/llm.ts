/** Mirror of backend/app/schemas/llm.py (CP9) */

export type LlmDemoRequest = {
  message: string;
};

export type LlmDemoResponse = {
  model: string;
  reply: string;
  latency_ms: number;
  prompt_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  temperature: number;
  max_output_tokens: number;
};
