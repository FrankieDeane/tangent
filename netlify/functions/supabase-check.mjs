// GET /api/supabase-check -> which Supabase settings exist and which tables answer. Never any value.
import { supaCheck } from "./_lib/supa.mjs";
import { json } from "./_lib/guard.mjs";
export default async () => json(200, await supaCheck());
export const config = { path: "/api/supabase-check" };
