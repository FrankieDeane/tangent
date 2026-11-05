// POST /api/translate { deviceId, to: "es"|"en", board } -> { board: translated text fields }
// Used when the person switches language on a board. Same rules as everything else.
import { checkText, identify, isBanned, underLimit, countUse, json } from "./_lib/guard.mjs";
import { translateBoard, setBudget, Blocked } from "./_lib/ai.mjs";

const str = (v, n) => String(v ?? "").slice(0, n);
const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);

// Only the visible text travels; pictures, sounds and numbers stay as they are.
function fieldsOf(b) {
  return {
    core: str(b.core, 220), summary: str(b.summary, 420), breathe: str(b.breathe, 140),
    ideas: arr(b.ideas, 3).map(x => ({ title: str(x?.title, 50), line: str(x?.line, 140) })),
    captions: arr(b.tiles, 5).map(t => str(t?.caption, 80)),
    steps: arr(b.steps, 3).map(s => ({ when: str(s?.when, 24), what: str(s?.what, 80) })),
    letgo: arr(b.letgo, 6).map(x => str(x, 60)), tangents: arr(b.tangents, 3).map(x => str(x, 50)),
    strength: { name: str(b.strength?.name, 40), how: str(b.strength?.how, 160) },
    brain: str(b.brain?.why, 200),
    spark: { jumps: arr(b.spark?.jumps, 5).map(x => str(x, 30)), link: str(b.spark?.link, 120), idea: str(b.spark?.idea, 220) },
  };
}
// Keep the translation to the same shape and size as the original.
function sameShape(src, out) {
  const s = (v, n, d) => (typeof v === "string" && v.trim() ? v.slice(0, n) : d);
  const o = out && typeof out === "object" ? out : {};
  return {
    core: s(o.core, 220, src.core), summary: s(o.summary, 420, src.summary), breathe: s(o.breathe, 140, src.breathe),
    ideas: src.ideas.map((x, i) => ({ title: s(o.ideas?.[i]?.title, 50, x.title), line: s(o.ideas?.[i]?.line, 140, x.line) })),
    captions: src.captions.map((x, i) => s(o.captions?.[i], 80, x)),
    steps: src.steps.map((x, i) => ({ when: s(o.steps?.[i]?.when, 24, x.when), what: s(o.steps?.[i]?.what, 80, x.what) })),
    letgo: src.letgo.map((x, i) => s(o.letgo?.[i], 60, x)), tangents: src.tangents.map((x, i) => s(o.tangents?.[i], 50, x)),
    strength: { name: s(o.strength?.name, 40, src.strength.name), how: s(o.strength?.how, 160, src.strength.how) },
    brain: s(o.brain, 200, src.brain),
    spark: { jumps: src.spark.jumps.map((x, i) => s(o.spark?.jumps?.[i], 30, x)), link: s(o.spark?.link, 120, src.spark.link), idea: s(o.spark?.idea, 220, src.spark.idea) },
  };
}
const allText = f => [f.core, f.summary, f.breathe, ...f.ideas.flatMap(x => [x.title, x.line]), ...f.captions, ...f.steps.flatMap(x => [x.when, x.what]), ...f.letgo, ...f.tangents, f.strength.name, f.strength.how, f.brain, ...f.spark.jumps, f.spark.link, f.spark.idea].join(" \n ");

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body;
  try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "tr"))) return json(429, { status: "limit" });
  const src = fieldsOf(body.board || {});
  if (!src.core) return json(400, { status: "empty" });
  if (checkText(allText(src))) return json(200, { status: "refused" });
  setBudget(20000);
  let out;
  try { out = sameShape(src, await translateBoard(src, body.to === "en" ? "en" : "es")); }
  catch (e) {
    if (e instanceof Blocked) return json(200, { status: "refused" });
    console.error("translate failed:", e.message);
    return json(502, { status: "ai_error" });
  }
  if (checkText(allText(out))) return json(200, { status: "ai_error" });
  await countUse(id, "tr");
  return json(200, { status: "ok", board: out });
};

export const config = { path: "/api/translate" };
