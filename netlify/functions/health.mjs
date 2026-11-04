// GET /api/health -> which settings are present (never their values) and whether Gemini answers.
import { health } from "./_lib/ai.mjs";
import { json } from "./_lib/guard.mjs";
export default async () => json(200, await health());
export const config = { path: "/api/health" };
