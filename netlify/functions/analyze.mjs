// POST /api/analyze  { deviceId, audio?: base64 WAV, text?: string }
// Order matters: ban check -> daily limit -> rules on input -> AI -> rules on AI verdict -> rules on output.
import { checkText, identify, isBanned, addStrike, underLimit, countUse, json } from "./_lib/guard.mjs";
import { analyzeAudio, analyzeText, findPhotos, Blocked, SCENES, PALETTES, SOUNDS, MOODS } from "./_lib/ai.mjs";

const MAX_AUDIO_B64 = 4_200_000; // about 60-70 s of 16 kHz mono WAV

async function violation(id, category) {
  if (category === "selfharm") return json(200, { status: "support" });
  const strikes = await addStrike(id, category);
  return json(200, { status: strikes >= 2 ? "banned" : "warning", strikes });
}

const str = (v, n) => String(v ?? "").slice(0, n);
const pick = (v, list, d) => (list.includes(v) ? v : d);

function shape(r) {
  const tiles = (Array.isArray(r.tiles) ? r.tiles : []).slice(0, 5).map(t => ({
    subject: str(t?.subject, 120), photo: str(t?.photo, 40), scene: pick(t?.scene, SCENES, "calmwater"), caption: str(t?.caption, 80),
  }));
  return {
    core: str(r.core, 220),
    mood: pick(r.mood, MOODS, "calm"),
    palette: pick(r.palette, PALETTES, "mist"),
    tiles,
    clip: Math.min(Math.max(0, Number(r.clip) || 0), Math.max(0, tiles.length - 1)),
    breathe: str(r.breathe, 140),
    mix: Object.fromEntries(["focus", "energy", "calm", "urgency", "clarity", "ideas"].map(k => [k, Math.max(0, Math.min(100, Math.round(Number(r.mix?.[k]) || 0)))])),
    steps: (Array.isArray(r.steps) ? r.steps : []).slice(0, 3).map(s => ({ when: str(s?.when, 24), what: str(s?.what, 80) })),
    keep: (Array.isArray(r.keep) ? r.keep : []).slice(0, 6).map(k => str(k, 30)),
    letgo: (Array.isArray(r.letgo) ? r.letgo : []).slice(0, 6).map(k => str(k, 60)),
    tangents: (Array.isArray(r.tangents) ? r.tangents : []).slice(0, 3).map(k => str(k, 50)),
    sounds: (Array.isArray(r.sounds) ? r.sounds : []).filter(s => SOUNDS.includes(s)).slice(0, 3),
    photo_query: str(r.photo_query, 40),
  };
}

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body;
  try { body = await req.json(); } catch { return json(400, { status: "error" }); }

  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "rec"))) return json(429, { status: "limit" });

  const text = typeof body.text === "string" ? body.text.trim().slice(0, 4000) : "";
  const audio = typeof body.audio === "string" ? body.audio : "";
  if (!text && !audio) return json(400, { status: "empty" });
  if (audio.length > MAX_AUDIO_B64) return json(413, { status: "too_long" });

  // 1. Rules on typed text, before anything is sent to an AI.
  if (text) { const v = checkText(text); if (v) return violation(id, v.category); }

  // 2. AI (Gemini, then Groq). A provider safety block counts as a violation.
  let r;
  try { r = audio ? await analyzeAudio(audio) : await analyzeText(text); }
  catch (e) {
    if (e instanceof Blocked) return violation(id, "provider");
    console.error("analyze failed:", e.message);
    return json(502, { status: "ai_error", reason: String(e.message || "").replace(/key=[^&\s]+/g, "").slice(0, 160) });
  }

  const transcript = str(r.transcript || text, 4000);

  // 3. Rules on what was actually said.
  const said = checkText(transcript);
  if (said) return violation(id, said.category);
  if (r.safety && r.safety.ok === false) return violation(id, r.safety.topic === "selfharm" ? "selfharm" : (r.safety.topic || "other"));
  if (r.language && !["es", "en"].includes(r.language)) return json(200, { status: "language" });
  if (!transcript.trim()) return json(200, { status: "empty" });

  // 4. Rules on what the AI produced. Never show it if it breaks a rule (no strike: not the person's fault).
  const board = shape(r);
  const produced = [board.core, board.breathe, board.photo_query, ...board.tiles.flatMap(t => [t.subject, t.photo, t.caption]), ...board.steps.flatMap(s => [s.when, s.what]), ...board.tangents].join(" \n ");
  if (checkText(produced) || !board.core || board.tiles.length < 3) return json(200, { status: "ai_error" });

  board.photos = await findPhotos(board.tiles.map(t => t.photo || t.subject));
  await countUse(id, "rec");
  return json(200, { status: "ok", transcript, language: r.language || "es", board, provider: r.provider });
};

export const config = { path: "/api/analyze" };
