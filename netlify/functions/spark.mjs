// POST /api/spark  The Spark: an ADHD brain jumps between things; Tangent finds the hidden thread.
//   { deviceId, lang, mode: "garden", items: [{ core, tangents, at }] }  -> links ideas recorded on different days
//   { deviceId, lang, mode: "images", images: [base64 JPEG], ideas: [core] } -> the pattern in photos, screenshots or charts
// Same rules as everything else: ban check, daily limit, rules on input and on what the AI writes.
// Images are only sent to the AI for this one reading; Tangent never stores them.
import { checkText, identify, isBanned, addStrike, underLimit, countUse, json } from "./_lib/guard.mjs";
import { sparkGarden, sparkImages, setBudget, Blocked } from "./_lib/ai.mjs";

const str = (v, n) => String(v ?? "").trim().slice(0, n);
const MAX_IMAGES = 4, MAX_IMG_B64 = 1_100_000, MIN_IMG_B64 = 2_000;

async function violation(id, category) {
  if (category === "selfharm") return json(200, { status: "support" });
  const strikes = await addStrike(id, category);
  return json(200, { status: strikes >= 2 ? "banned" : "warning", strikes });
}
function ago(at) {
  const d = Math.floor((Date.now() - Number(at || 0)) / 864e5);
  return !at || d < 0 ? "some time ago" : d === 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body;
  try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "spark"))) return json(429, { status: "limit" });
  const lang = body.lang === "en" ? "en" : "es";
  setBudget(25000);

  if (body.mode === "garden") {
    // Past boards were already checked when they were made; check again anyway and drop anything that breaks a rule.
    const items = (Array.isArray(body.items) ? body.items : []).slice(0, 12)
      .map(x => ({ core: str(x?.core, 220), tangents: (Array.isArray(x?.tangents) ? x.tangents : []).slice(0, 3).map(t => str(t, 50)).filter(Boolean), at: Number(x?.at) || 0 }))
      .filter(x => x.core && !checkText([x.core, ...x.tangents].join(" \n ")))
      .map(x => ({ ...x, ago: ago(x.at) }));
    if (items.length < 2) return json(400, { status: "few" });
    let r;
    try { r = await sparkGarden(items, lang); }
    catch (e) {
      if (e instanceof Blocked) return json(200, { status: "ai_error" });
      console.error("spark garden failed:", e.message);
      return json(502, { status: "ai_error" });
    }
    const from = [...new Set((Array.isArray(r.from) ? r.from : []).map(Number).filter(i => Number.isInteger(i) && i >= 0 && i < items.length))].slice(0, 4);
    const labels = from.map((_, i) => str(r.labels?.[i], 30) || items[from[i]].core.split(/\s+/).slice(0, 3).join(" "));
    const out = { from, labels, link: str(r.link, 120), idea: str(r.idea, 240), step: str(r.step, 70), pattern: str(r.pattern, 50) };
    if (from.length < 2 || !out.link || !out.idea || checkText([...labels, out.link, out.idea, out.step, out.pattern].join(" \n "))) return json(200, { status: "ai_error" });
    await countUse(id, "spark");
    return json(200, { status: "ok", spark: out });
  }

  if (body.mode === "images") {
    const images = (Array.isArray(body.images) ? body.images : []).slice(0, MAX_IMAGES).map(x => String(x || "").replace(/^data:image\/\w+;base64,/, ""));
    if (!images.length || images.some(x => x.length < MIN_IMG_B64 || !/^[A-Za-z0-9+/=]+$/.test(x.slice(0, 200)))) return json(400, { status: "empty" });
    if (images.some(x => x.length > MAX_IMG_B64)) return json(413, { status: "too_big" });
    const ideas = (Array.isArray(body.ideas) ? body.ideas : []).slice(0, 5).map(x => str(x, 220)).filter(x => x && !checkText(x));
    let r;
    try { r = await sparkImages(images, ideas, lang); }
    catch (e) {
      if (e instanceof Blocked) return violation(id, "provider");
      console.error("spark images failed:", e.message);
      return json(502, { status: "ai_error" });
    }
    if (r.safety && r.safety.ok === false) return violation(id, r.safety.topic === "selfharm" ? "selfharm" : (r.safety.topic || "other"));
    const out = {
      see: images.map((_, i) => str(r.see?.[i], 70)), pattern: str(r.pattern, 140), name: str(r.name, 40),
      link: str(r.link, 140), idea: str(r.idea, 240), step: str(r.step, 70),
    };
    if (!out.pattern || !out.idea || checkText([...out.see, out.pattern, out.name, out.link, out.idea, out.step].join(" \n "))) return json(200, { status: "ai_error" });
    await countUse(id, "spark");
    return json(200, { status: "ok", spark: out });
  }

  return json(400, { status: "error" });
};

export const config = { path: "/api/spark" };
