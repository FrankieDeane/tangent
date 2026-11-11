// POST /api/study { deviceId, code?, source: {title, author?, page?}, topic?, transcript?, image?: base64 JPEG }
// -> { status: "ok", result: { title, plain, points, concepts, check, review } } with every text in es and en.
// Rule: no source, no summary. The app explains what the student said; the source is the student's responsibility.
import { checkStudyText, identify, isBanned, underLimit, countUse, json } from "./_lib/guard.mjs";
import { studyExplain, setBudget, Blocked } from "./_lib/ai.mjs";
import { codeOk, freeLeft, useFree } from "./_lib/access.mjs";

const MAX_IMAGE_B64 = 2_800_000;
const s = (v, n) => String(v ?? "").trim().slice(0, n);
const pair = (v, n) => ({ es: s(v?.es, n), en: s(v?.en, n) });
const list = (v, n, max) => ({ es: (Array.isArray(v?.es) ? v.es : []).map(x => s(x, n)).filter(Boolean).slice(0, max), en: (Array.isArray(v?.en) ? v.en : []).map(x => s(x, n)).filter(Boolean).slice(0, max) });

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  const member = codeOk(body.code);
  if (!member && (await freeLeft(id)) <= 0) return json(200, { status: "paywall" });
  if (!(await underLimit(id, "study"))) return json(429, { status: "limit" });

  const source = { title: s(body.source?.title, 160), author: s(body.source?.author, 120), page: s(body.source?.page, 60) };
  if (source.title.length < 2) return json(400, { status: "no_source" });
  const topic = s(body.topic, 120);
  const transcript = s(body.transcript, 12000);
  const image = typeof body.image === "string" ? body.image : "";
  if (!transcript && !image) return json(400, { status: "empty" });
  if (image.length > MAX_IMAGE_B64) return json(413, { status: "too_big" });

  const said = checkStudyText([source.title, topic, transcript].join(" \n "));
  if (said) return json(200, { status: said.category === "selfharm" ? "support" : "blocked" });

  // Too many inaudible parts: ask to record again instead of guessing.
  const words = transcript.split(/\s+/).filter(Boolean).length, unknown = (transcript.match(/\[\?\]/g) || []).length;
  if (!image && words && unknown / words > 0.15) return json(200, { status: "unclear", transcript });

  setBudget(24000);
  let r;
  try { r = await studyExplain({ transcript, source, topic, image }); }
  catch (e) {
    if (e instanceof Blocked) return json(200, { status: "blocked" });
    console.error("study failed:", e.message);
    return json(502, { status: "ai_error" });
  }
  if (r.safety && r.safety.ok === false) return json(200, { status: r.safety.topic === "selfharm" ? "support" : "blocked" });
  if (r.language === "other") return json(200, { status: "language" });
  if (r.clarity === "low") return json(200, { status: "unclear", transcript });

  const result = {
    title: pair(r.title, 60), plain: pair(r.plain, 1400), points: list(r.points, 160, 5), check: list(r.check, 160, 3), review: pair(r.review, 300),
    concepts: (Array.isArray(r.concepts) ? r.concepts : []).slice(0, 3).map(c => ({ es: s(c?.es, 40), en: s(c?.en, 40), photo: s(c?.photo, 50) })).filter(c => c.es || c.en),
  };
  if (!result.plain.es && !result.plain.en) return json(502, { status: "ai_error" });
  const out = [result.title.es, result.title.en, result.plain.es, result.plain.en, ...result.points.es, ...result.points.en].join(" \n ");
  if (checkStudyText(out)) return json(200, { status: "ai_error" });

  await countUse(id, "study");
  if (!member) await useFree(id);
  return json(200, { status: "ok", result, transcript, provider: r.provider });
};

export const config = { path: "/api/study" };
