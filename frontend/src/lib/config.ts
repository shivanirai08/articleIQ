/** Frontend-safe configuration (Objective O6).

Only variables prefixed with NEXT_PUBLIC_ are exposed to browser JavaScript.
Never put GEMINI_API_KEY here — that stays on the FastAPI backend only.
*/

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
