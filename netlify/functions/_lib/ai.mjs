import { getStore } from "@netlify/blobs";
import { checkText } from "./guard.mjs";
// AI providers: Google Gemini first, Groq as the free backup.

const SAFETY = ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"]
  .map(category => ({ category, threshold: "BLOCK_LOW_AND_ABOVE" }));

export const SCENES = ["sunrise", "calmwater", "inbox", "coffee", "notebook", "path", "clock", "headphones", "seedling", "stars", "door", "people", "mountain", "bulb", "sea"];
export const PALETTES = ["dawn", "mist", "forest", "sea", "dusk", "sand"];
export const SOUNDS = ["rain", "waves", "wind", "birds", "storm", "thunder", "fire", "forest", "river", "night", "cafe", "horse"];
export const MOODS = ["calm", "anxious", "excited", "tired", "sad", "focused", "scattered"];

export class Blocked extends Error { constructor(reason) { super("blocked"); this.reason = reason; } }

function withTimeout(ms) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); return { signal: c.signal, done: () => clearTimeout(t) }; }

async function gemini(parts, { json = true, temperature = 0.7, timeout = 40000 } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("gemini_not_configured");
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const to = withTimeout(timeout);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", signal: to.signal,
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature, ...(json ? { responseMimeType: "application/json" } : {}) },
        safetySettings: SAFETY,
      }),
    });
    if (!r.ok) throw new Error("gemini_http_" + r.status);
    const d = await r.json();
    if (d.promptFeedback?.blockReason) throw new Blocked("provider_" + d.promptFeedback.blockReason);
    const c = d.candidates?.[0];
    if (!c) throw new Error("gemini_empty");
    if (["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII"].includes(c.finishReason)) throw new Blocked("provider_" + c.finishReason);
    return (c.content?.parts || []).map(p => p.text || "").join("");
  } finally { to.done(); }
}

async function groqChat(prompt, { temperature = 0.7, timeout = 30000 } = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("groq_not_configured");
  const to = withTimeout(timeout);
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", signal: to.signal,
      headers: { "content-type": "application/json", authorization: "Bearer " + key },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature,
      }),
    });
    if (!r.ok) throw new Error("groq_http_" + r.status);
    const d = await r.json();
    return d.choices?.[0]?.message?.content || "";
  } finally { to.done(); }
}

async function groqTranscribe(wavBase64) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("groq_not_configured");
  const fd = new FormData();
  fd.append("file", new Blob([Buffer.from(wavBase64, "base64")], { type: "audio/wav" }), "note.wav");
  fd.append("model", process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo");
  fd.append("response_format", "json");
  const to = withTimeout(30000);
  try {
    const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", body: fd, signal: to.signal, headers: { authorization: "Bearer " + key } });
    if (!r.ok) throw new Error("groq_whisper_http_" + r.status);
    return (await r.json()).text || "";
  } finally { to.done(); }
}

export function parseJSON(text) {
  try { return JSON.parse(text); } catch {}
  const m = String(text).match(/[\[{][\s\S]*[\]}]/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  throw new Error("bad_json");
}

const RULES = `Safety rules (strict): this is a calm tool for adults with ADHD. Mark "safety.ok" false if the person talks about ANY of these: sex, sexuality, erotism, pornography, sexual positions, nudity, anything involving minors in a sexual way, violence, aggression, weapons, war, terrorism, racism or hate, politics or politicians or elections, abortion, death or dying, suicide or self-harm or wanting to die, drugs, or if they use insults or swear words (English or Spanish). Use topic "selfharm" whenever there is any sign of suicide, self-harm or wanting to die. Only Spanish and English are accepted: set "language" to "other" for anything else.`;

function boardPrompt(source) {
  return `You help a person with ADHD. They recorded a rambling voice note about an idea, a plan or what is in their head. Find its core and turn it into a calm visual mood board. Be warm, brief, never clinical, never preachy.

${RULES}

${source}

Reply with ONLY a JSON object:
{"transcript": "exact transcript of what the person said (for typed text, copy it)",
 "language": "es|en|other",
 "safety": {"ok": true or false, "topic": "none|sexual|minors|violence|war|hate|politics|abortion|death|selfharm|drugs|profanity|other"},
 "core": "the core idea in one or two short sentences, max 22 words, second person, calm, in the person's language",
 "mood": "one of ${MOODS.join("|")}",
 "palette": "one of ${PALETTES.join("|")} matching the mood",
 "tiles": [5 objects {"subject": "a concrete, friendly thing or scene to draw from what they actually said, 4-10 words in English", "photo": "2 to 4 plain English words to search a real, calm, wholesome stock photo of that subject, e.g. coffee cup morning", "scene": "closest of ${SCENES.join("|")}", "caption": "max 7 words, image-like, in the person's language"}],
 "mix": {"focus": 0-100, "energy": 0-100, "calm": 0-100, "urgency": 0-100, "clarity": 0-100, "ideas": 0-100} estimated from how they spoke (ideas = how many separate ideas came up),
 "clip": "index 0-4 of the tile that best captures the whole idea",
 "breathe": "one calming line, max 14 words, only if they sound stressed or overwhelmed, else empty string",
 "steps": [3 objects {"when": "short time like 7:00, Hoy/Today, Después/Next", "what": "a concrete action, max 7 words, starting with a verb"}],
 "keep": [3 to 6 single key words copied exactly from the transcript],
 "letgo": [3 to 6 short noisy phrases copied from the transcript that can be set aside],
 "tangents": [0 to 3 side ideas they mentioned that are not the core, max 5 words each],
 "sounds": [1 to 3 of ${SOUNDS.join("|")} that fit the scenes they imagined or would calm them],
 "photo_query": "2 or 3 English words for a calm, safe stock photo that fits the core"}
If safety.ok is false or language is "other", still return the JSON but leave core, tiles, steps and the rest empty.`;
}

export async function analyzeAudio(wavBase64) {
  const prompt = boardPrompt("The voice note is attached as audio. Transcribe it, then analyse it.");
  try {
    return { ...parseJSON(await gemini([{ inline_data: { mime_type: "audio/wav", data: wavBase64 } }, { text: prompt }])), provider: "gemini" };
  } catch (e) {
    if (e instanceof Blocked) throw e;
    console.warn("gemini audio failed, trying groq:", e.message);
    const transcript = await groqTranscribe(wavBase64);
    return analyzeTextWithGroq(transcript);
  }
}

export async function analyzeText(text) {
  const prompt = boardPrompt(`Voice note transcript: """${text.slice(0, 4000)}"""`);
  try {
    return { ...parseJSON(await gemini([{ text: prompt }])), provider: "gemini" };
  } catch (e) {
    if (e instanceof Blocked) throw e;
    console.warn("gemini text failed, trying groq:", e.message);
    return analyzeTextWithGroq(text);
  }
}

async function analyzeTextWithGroq(text) {
  const prompt = boardPrompt(`Voice note transcript: """${String(text).slice(0, 4000)}"""`);
  const out = parseJSON(await groqChat(prompt));
  if (!out.transcript) out.transcript = text;
  return { ...out, provider: "groq" };
}

function drawPrompt(subjects, palette) {
  return `Draw ${subjects.length} small flat illustrations as SVG for a calm, beautiful mood board for a person with ADHD. Everything must be wholesome and suitable for all ages.
Palette: use only these colours plus white: ${palette.join(", ")}.
Rules for each drawing: the canvas is viewBox 0 0 300 220 and is already set, so give only the inner elements. Start with a rect covering the whole canvas as background. Use only rect, circle, ellipse, path, polygon, polyline, line, g, defs, linearGradient, radialGradient, stop. No text, no images, no style attributes, no scripts. Simple, soft, friendly shapes, like a minimal modern picture book. Make the subject clearly recognisable and centred. At most 1600 characters each.
Subjects, in order:
${subjects.map((s, i) => `${i}: ${s}`).join("\n")}
Reply with ONLY a JSON object {"svgs": [${subjects.length} strings, each the inner SVG markup for that subject, in order]}.`;
}

export async function drawSvgs(subjects, palette) {
  const prompt = drawPrompt(subjects, palette);
  let out;
  try { out = parseJSON(await gemini([{ text: prompt }], { temperature: 0.8, timeout: 50000 })); }
  catch (e) {
    if (e instanceof Blocked) throw e;
    out = parseJSON(await groqChat(prompt, { temperature: 0.8, timeout: 45000 }));
  }
  const arr = Array.isArray(out) ? out : out.svgs;
  return Array.isArray(arr) ? arr.map(sanitizeSvg) : [];
}

// Server-side SVG clean-up (the browser cleans again before showing it).
const OK_TAGS = new Set(["g", "defs", "lineargradient", "radialgradient", "stop", "rect", "circle", "ellipse", "path", "polygon", "polyline", "line"]);
export function sanitizeSvg(s) {
  if (typeof s !== "string") return null;
  s = s.slice(0, 6000).replace(/<!--[\s\S]*?-->/g, "");
  let bad = false;
  const cleaned = s.replace(/<\/?\s*([a-zA-Z][\w:-]*)([^>]*)>/g, (m, tag, attrs) => {
    if (!OK_TAGS.has(tag.toLowerCase())) { bad = bad || /script|foreign|iframe|image|use|a$/i.test(tag); return ""; }
    if (m.startsWith("</")) return `</${tag}>`;
    const safe = attrs
      .replace(/\s(on\w+|style|href|xlink:href|src)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/url\(\s*['"]?(?!#)[^)]*\)/gi, "none")
      .replace(/javascript:/gi, "");
    return `<${tag}${safe}>`;
  });
  return cleaned.trim() || null;
}


const UTM = "utm_source=tangent&utm_medium=referral";
const photoCache = () => { try { return getStore({ name: "tangent-photos" }); } catch { return null; } };

async function unsplashOne(query, key) {
  const q = String(query || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  if (!q) return null;
  const cache = photoCache();
  try { const hit = cache && await cache.get(q, { type: "json" }); if (hit && Date.now() - hit.at < 7 * 864e5) return hit.photo; } catch {}
  let photo = null;
  try {
    const to = withTimeout(6000);
    const r = await fetch(`https://api.unsplash.com/search/photos?per_page=5&orientation=landscape&content_filter=high&query=${encodeURIComponent(q)}`, {
      headers: { authorization: `Client-ID ${key}`, "accept-version": "v1" }, signal: to.signal,
    });
    to.done();
    if (!r.ok) return null;
    const d = await r.json();
    // first result whose own description passes the site rules
    const p = (d.results || []).find(x => !checkText(`${x.alt_description || ""} ${x.description || ""}`));
    if (p) photo = {
      src: `${p.urls.raw}&w=1080&h=720&fit=crop&auto=format&q=75`,
      color: p.color || null,
      alt: String(p.alt_description || q).slice(0, 140),
      credit: String(p.user?.name || "Unsplash").slice(0, 60),
      profile: `${p.user?.links?.html || "https://unsplash.com"}?${UTM}`,
      url: `${p.links?.html || "https://unsplash.com"}?${UTM}`,
      dl: p.links?.download_location || null,
    };
  } catch { return null; }
  try { if (cache) await cache.setJSON(q, { at: Date.now(), photo }); } catch {}
  return photo;
}

// One Unsplash photo per tile (null where none). Hotlinked, credited, and the download event is reported as Unsplash requires.
export async function findPhotos(queries) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || !queries?.length) return [];
  const photos = await Promise.all(queries.map(q => unsplashOne(q, key)));
  const seen = new Set();
  const out = photos.map(p => (p && !seen.has(p.src) && seen.add(p.src) ? p : null));
  await Promise.all(out.filter(p => p?.dl).map(p => fetch(`${p.dl}${p.dl.includes("?") ? "&" : "?"}client_id=${key}`).catch(() => {})));
  return out.map(p => p && (({ dl, ...rest }) => rest)(p));
}
