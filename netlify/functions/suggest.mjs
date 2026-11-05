// POST /api/suggest { deviceId, kind: "idea" | "regret", text, email? } -> stored for the owner.
// GET /api/suggest?token=STATS_TOKEN -> the latest 200 (owner only).
import { getStore } from "@netlify/blobs";
import { checkText, identify, isBanned, underLimit, countUse, json } from "./_lib/guard.mjs";
const box = () => getStore({ name: "tangent-suggestions", consistency: "strong" });

export default async (req, context) => {
  if (req.method === "GET") {
    const t = new URL(req.url).searchParams.get("token");
    if (!process.env.STATS_TOKEN || t !== process.env.STATS_TOKEN) return json(401, { status: "no" });
    const { blobs } = await box().list();
    const keys = blobs.map(b => b.key).sort().reverse().slice(0, 200);
    const items = await Promise.all(keys.map(k => box().get(k, { type: "json" })));
    return json(200, { status: "ok", items });
  }
  if (req.method !== "POST") return json(405, { status: "error" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "suggest"))) return json(429, { status: "limit" });
  const kind = body.kind === "regret" ? "regret" : "idea";
  const text = String(body.text || "").trim().slice(0, 1500);
  const email = String(body.email || "").trim().slice(0, 120);
  if (kind === "idea" && text.length < 4) return json(400, { status: "empty" });
  if (kind === "regret" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(400, { status: "email" });
  if (text && checkText(text)) return json(200, { status: "rules" });
  const at = new Date().toISOString();
  await box().setJSON(`${at}-${Math.random().toString(36).slice(2, 8)}`, { kind, text, email: email || null, lang: body.lang === "en" ? "en" : "es", at });
  await countUse(id, "suggest");
  return json(200, { status: "ok" });
};
export const config = { path: "/api/suggest" };
