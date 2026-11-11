// POST /api/study-check { deviceId, code?, source: {title}, topic?, transcript }
// -> { status: "ok", issues: [{said, fix: {es, en}}], sources: [{title, uri}] }
// Checks what the student said against web sources (Gemini + Google Search). It never rewrites their work.
import { checkStudyText, identify, isBanned, underLimit, countUse, json } from "./_lib/guard.mjs";
import { studyFactCheck, setBudget } from "./_lib/ai.mjs";
import { codeOk } from "./_lib/access.mjs";

const s = (v, n) => String(v ?? "").trim().slice(0, n);

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  const member = codeOk(body.code);
  if (!(await underLimit(id, member ? "check" : "check-free"))) return json(429, { status: "limit" });
  const transcript = s(body.transcript, 8000), source = { title: s(body.source?.title, 160) }, topic = s(body.topic, 120);
  if (!transcript || source.title.length < 2) return json(400, { status: "empty" });
  if (checkStudyText(transcript)) return json(200, { status: "ok", issues: [], sources: [] });
  setBudget(24000);
  try {
    const r = await studyFactCheck({ transcript, source, topic });
    const issues = r.issues.slice(0, 4).map(i => ({ said: s(i?.said, 200), fix: { es: s(i?.fix?.es, 300), en: s(i?.fix?.en, 300) } })).filter(i => i.fix.es || i.fix.en);
    if (checkStudyText(issues.map(i => i.fix.es + " " + i.fix.en).join(" "))) return json(200, { status: "ok", issues: [], sources: [] });
    await countUse(id, member ? "check" : "check-free");
    return json(200, { status: "ok", issues, sources: r.sources });
  } catch (e) {
    console.error("study check failed:", e.message);
    return json(502, { status: "ai_error" });
  }
};

export const config = { path: "/api/study-check" };
