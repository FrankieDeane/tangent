// GET /api/config -> public Supabase settings for the browser (URL and the public anon key), or null.
import { publicConfig } from "./_lib/supa.mjs";
import { json } from "./_lib/guard.mjs";
export default async () => json(200, { supabase: publicConfig() });
export const config = { path: "/api/config" };
