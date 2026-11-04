// POST /api/photos  { deviceId, queries: string[] }  -> one real photo per query (or null)
import { checkText, identify, isBanned, json } from "./_lib/guard.mjs";
import { findPhotos, setBudget } from "./_lib/ai.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body;
  try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  const queries = (Array.isArray(body.queries) ? body.queries : []).slice(0, 5).map(q => String(q || "").slice(0, 60));
  if (!queries.length || checkText(queries.join(" \n "))) return json(200, { status: "ok", photos: [] });
  setBudget(20000);
  try { return json(200, { status: "ok", photos: await findPhotos(queries) }); }
  catch (e) { console.error("photos failed:", e.message); return json(200, { status: "ok", photos: [] }); }
};

export const config = { path: "/api/photos" };
