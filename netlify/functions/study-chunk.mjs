// POST /api/study-chunk { deviceId, code?, audio: base64 WAV (about 60 s) } -> { status, text }
// The browser cuts a long recording into pieces and sends them while the student keeps talking.
// Audio is never stored: it is transcribed and dropped.
import { identify, isBanned, underLimit, countUse, json } from "./_lib/guard.mjs";
import { studyTranscribe, setBudget, Blocked } from "./_lib/ai.mjs";
import { codeOk, freeLeft } from "./_lib/access.mjs";

const MAX_AUDIO_B64 = 5_400_000;

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  const member = codeOk(body.code);
  if (!member && (await freeLeft(id)) <= 0) return json(200, { status: "paywall" });
  if (!member && !(await underLimit(id, "chunk"))) return json(429, { status: "limit" });
  const audio = typeof body.audio === "string" ? body.audio : "";
  if (!audio) return json(400, { status: "empty" });
  if (audio.length > MAX_AUDIO_B64) return json(413, { status: "too_long" });
  setBudget(23000);
  try {
    const r = await studyTranscribe(audio);
    await countUse(id, "chunk");
    return json(200, { status: "ok", text: String(r.text || "").slice(0, 6000) });
  } catch (e) {
    if (e instanceof Blocked) return json(200, { status: "blocked" });
    console.error("study chunk failed:", e.message);
    return json(502, { status: "ai_error" });
  }
};

export const config = { path: "/api/study-chunk" };
