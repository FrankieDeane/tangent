// POST /api/study-simple { deviceId, code, title, plain, simple } -> { status: "ok", level, good: {es,en}, hardWords: [], missing: {es: [], en: []} }
// Paid plan only: the student explains the topic as if to an 8-year-old and gets hints, never a ready-made answer.
import { checkStudyText, identify, isBanned, underLimit, countUse, json } from "./_lib/guard.mjs";
import { studySimple, setBudget, Blocked } from "./_lib/ai.mjs";
import { codeOk } from "./_lib/access.mjs";

const s = (v, n) => String(v ?? "").trim().slice(0, n);
const list = (v, n, max) => (Array.isArray(v) ? v : []).slice(0, max).map(x => s(x, n)).filter(Boolean);

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!codeOk(body.code)) return json(402, { status: "paywall" });
  if (!(await underLimit(id, "simple"))) return json(429, { status: "limit" });
  const simple = s(body.simple, 3000), plain = s(body.plain, 2000), title = s(body.title, 120);
  if (simple.length < 20) return json(400, { status: "empty" });
  const bad = checkStudyText(simple);
  if (bad) return json(200, { status: bad.category === "selfharm" ? "support" : "blocked" });
  setBudget(22000);
  try {
    const r = await studySimple({ simple, plain, title });
    const out = {
      level: ["clear", "almost", "not_yet"].includes(r.level) ? r.level : "almost",
      good: { es: s(r.good?.es, 240), en: s(r.good?.en, 240) },
      hardWords: list(r.hard_words, 40, 4),
      missing: { es: list(r.missing?.es, 200, 2), en: list(r.missing?.en, 200, 2) },
    };
    if (checkStudyText([out.good.es, out.good.en, ...out.missing.es, ...out.missing.en].join(" "))) return json(200, { status: "blocked" });
    await countUse(id, "simple");
    return json(200, { status: "ok", ...out });
  } catch (e) {
    if (e instanceof Blocked) return json(200, { status: "blocked" });
    console.error("study simple failed:", e.message);
    return json(502, { status: "ai_error" });
  }
};

export const config = { path: "/api/study-simple" };
