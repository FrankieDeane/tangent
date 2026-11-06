// POST /api/tasks  { deviceId, lang, audio?: base64 WAV, text?: string, owner?: string }
// Burbujas: one messy voice note -> up to 7 tasks. Same rule order as /api/analyze:
// ban check -> free-use rule -> daily limit -> rules on input -> AI -> rules on what was said -> rules on output.
import { getStore } from "@netlify/blobs";
import { checkText, identify, isBanned, addStrike, underLimit, countUse, today, json } from "./_lib/guard.mjs";
import { tasksAudio, tasksText, setBudget, Blocked } from "./_lib/ai.mjs";
import { userFromToken, planOf } from "./_lib/supa.mjs";

const MAX_AUDIO_B64 = 5_400_000;
const FREE_USES = Number(process.env.TANGENT_FREE_USES || 1);   // without an account
const FREE_PER_IP_DAY = Number(process.env.TANGENT_FREE_PER_IP || 6); // shared wifi, but no farming
const PRIOS = ["alta", "media", "baja"];
const ICONS = ["send", "shirt", "phone", "bolt", "run", "cart", "home", "mail", "calendar", "money", "doc", "heart", "car", "book", "food", "work", "clean", "plant", "pet", "health", "other"];
const str = (v, n) => String(v ?? "").trim().slice(0, n);
const usage = () => getStore({ name: "tangent-usage", consistency: "strong" });

async function violation(id, category) {
  if (category === "selfharm") return json(200, { status: "support" });
  const strikes = await addStrike(id, category);
  return json(200, { status: strikes >= 2 ? "banned" : "warning", strikes });
}

// A date only counts if the words that said it are really in the transcript, and it is a real, near date.
function when(w, low, today) {
  if (!w || typeof w !== "object") return null;
  const date = String(w.date || ""), time = String(w.time || ""), said = str(w.said, 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !said || !low.includes(said.toLowerCase())) return null;
  const d = Date.parse(date + "T12:00:00Z"), t0 = Date.parse((today || new Date().toISOString().slice(0, 10)) + "T12:00:00Z");
  if (!Number.isFinite(d) || d < t0 - 864e5 || d > t0 + 400 * 864e5) return null;
  return { date, time: /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : null, said };
}

function shape(r, transcript, today) {
  const low = transcript.toLowerCase();
  return (Array.isArray(r.tasks) ? r.tasks : []).slice(0, 7).map((t, i) => {
    let priority = PRIOS.includes(t?.priority) ? t.priority : null;
    let cue = priority ? str(t?.priority_cue, 40) : "";
    // The cue must really be in what they said; otherwise we don't trust the priority and ask.
    if (priority && (!cue || !low.includes(cue.toLowerCase()))) { priority = null; cue = ""; }
    const steps = (Array.isArray(t?.emergency_steps) ? t.emergency_steps : []).map(s => str(s, 90)).filter(Boolean).slice(0, 2);
    return {
      id: "t" + i + Math.random().toString(36).slice(2, 7),
      title: str(t?.title, 36), summary: str(t?.summary, 200), raw: str(t?.raw_quote, 220),
      icon: ICONS.includes(t?.icon) ? t.icon : "other", priority, cue: cue || null, steps,
      when: when(t?.when, low, today), pq: str(t?.photo_query, 50).replace(/[^a-z0-9 ]/gi, "").trim() || null,
    };
  }).filter(t => t.title && t.steps.length);
}

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body;
  try { body = await req.json(); } catch { return json(400, { status: "error" }); }

  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });

  // An account with an active plan records without the free limit.
  const user = body.accessToken ? await userFromToken(body.accessToken) : null;
  const plan = user ? await planOf(user.id) : "free";
  const owner = (Boolean(process.env.STATS_TOKEN) && body.owner === process.env.STATS_TOKEN) || plan === "active";
  const u = usage(), freeKey = "free:" + id.dev, ipKey = `${today()}:free:${id.ip}`;
  if (!owner) {
    const [mine, net] = await Promise.all([u.get(freeKey, { type: "json" }), u.get(ipKey, { type: "json" })]);
    if ((mine?.n || 0) >= FREE_USES || (net?.n || 0) >= FREE_PER_IP_DAY) return json(200, { status: "paywall", signedIn: Boolean(user), plan });
  }
  if (!(await underLimit(id, "rec"))) return json(429, { status: "limit" });

  const lang = body.lang === "en" ? "en" : "es";
  const day = /^\d{4}-\d{2}-\d{2}$/.test(body.today || "") ? { date: body.today, dow: str(body.dow, 12) } : null;
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 4000) : "";
  const audio = typeof body.audio === "string" ? body.audio : "";
  if (!text && !audio) return json(400, { status: "empty" });
  if (audio.length > MAX_AUDIO_B64) return json(413, { status: "too_long" });
  if (text) { const v = checkText(text); if (v) return violation(id, v.category); }

  setBudget(23000);
  let r;
  try { r = audio ? await tasksAudio(audio, lang, day) : await tasksText(text, lang, day); }
  catch (e) {
    if (e instanceof Blocked) return violation(id, "provider");
    console.error("tasks failed:", e.message);
    return json(502, { status: "ai_error" });
  }

  const transcript = str(r.transcript || text, 4000);
  const said = checkText(transcript);
  if (said) return violation(id, said.category);
  if (r.safety && r.safety.ok === false) return violation(id, r.safety.topic === "selfharm" ? "selfharm" : (r.safety.topic || "other"));
  if (r.language && !["es", "en"].includes(r.language)) return json(200, { status: "language" });
  if (!transcript) return json(200, { status: "empty" });

  const tasks = shape(r, transcript, day?.date);
  if (!tasks.length) return json(200, { status: "no_tasks", transcript });
  if (checkText(tasks.flatMap(t => [t.title, t.summary, ...t.steps]).join(" \n "))) return json(200, { status: "ai_error" });

  await countUse(id, "rec");
  if (!owner) {
    const inc = async k => { const v = await u.get(k, { type: "json" }); await u.setJSON(k, { n: (v?.n || 0) + 1, at: new Date().toISOString() }); };
    await Promise.all([inc(freeKey), inc(ipKey)]);
  }
  return json(200, { status: "ok", transcript, tasks, provider: r.provider });
};

export const config = { path: "/api/tasks" };
