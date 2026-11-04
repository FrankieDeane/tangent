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

let DEADLINE = Infinity;
export function setBudget(ms) { DEADLINE = Date.now() + ms; }
const left = () => DEADLINE - Date.now();
const cap = ms => Math.max(0, Math.min(ms, left() - 800));
function withTimeout(ms) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); return { signal: c.signal, done: () => clearTimeout(t) }; }

const GEMINI_MODELS = () => [...new Set([process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"].filter(Boolean))];
async function gemini(parts, opts = {}) {
  let last;
  const models = GEMINI_MODELS();
  for (const [i, model] of models.entries()) {
    if (left() < 5000) break;
    // leave time for the Groq fallback: Gemini gets at most ~60% of what is left
    const timeout = cap(Math.min(opts.timeout || 40000, i === 0 ? left() * 0.6 : left() * 0.4));
    try { return await geminiOnce(model, parts, { ...opts, timeout }); }
    catch (e) {
      last = e;
      // try the next model when this one is missing, overloaded, rate limited or erroring; stop on safety blocks and bad keys
      if (e instanceof Blocked || !/gemini_http_(400|404|429|500|503|504)|gemini_empty|aborted|timeout/i.test(e.message)) throw e;
    }
  }
  throw last || new Error("gemini_no_time");
}
async function geminiOnce(model, parts, { json = true, temperature = 0.7, timeout = 40000 } = {}) {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("gemini_not_configured");
  const to = withTimeout(timeout);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", signal: to.signal,
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature, ...(json ? { responseMimeType: "application/json" } : {}), thinkingConfig: { thinkingBudget: 0 } },
        safetySettings: SAFETY,
      }),
    });
    if (!r.ok) {
      let why = ""; try { why = (await r.json())?.error?.message || ""; } catch {}
      throw new Error(`gemini_http_${r.status} ${model}: ${why.slice(0, 160)}`);
    }
    const d = await r.json();
    if (d.promptFeedback?.blockReason) throw new Blocked("provider_" + d.promptFeedback.blockReason);
    const c = d.candidates?.[0];
    if (!c) throw new Error("gemini_empty");
    if (["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII"].includes(c.finishReason)) throw new Blocked("provider_" + c.finishReason);
    return (c.content?.parts || []).map(p => p.text || "").join("");
  } finally { to.done(); }
}

const GROQ_MODELS = () => [...new Set([process.env.GROQ_MODEL, "llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.1-8b-instant"].filter(Boolean))];
async function groqError(r, what) {
  let why = ""; try { why = (await r.json())?.error?.message || ""; } catch {}
  return new Error(`${what}_http_${r.status}: ${why.slice(0, 160)}`);
}
async function groqChat(prompt, { temperature = 0.7, timeout = 25000 } = {}) {
  const key = (process.env.GROQ_API_KEY || "").trim();
  if (!key) throw new Error("groq_not_configured");
  let last;
  for (const model of GROQ_MODELS()) {
    if (left() < 2500) break;
    const to = withTimeout(cap(timeout));
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", signal: to.signal,
        headers: { "content-type": "application/json", authorization: "Bearer " + key },
        body: JSON.stringify({ model, messages: [{ role: "system", content: "Reply with a single JSON object only." }, { role: "user", content: prompt }], response_format: { type: "json_object" }, temperature }),
      });
      if (!r.ok) { last = await groqError(r, "groq_" + model); if ([400, 404, 413, 429, 498, 500, 502, 503].includes(r.status)) continue; throw last; }
      const d = await r.json();
      const out = d.choices?.[0]?.message?.content || "";
      if (out) return out;
      last = new Error("groq_empty_" + model);
    } catch (e) { last = e; if (/groq_.*_http_(401|403)/.test(e.message)) throw e; }
    finally { to.done(); }
  }
  throw last || new Error("groq_failed");
}

async function groqTranscribe(wavBase64) {
  const key = (process.env.GROQ_API_KEY || "").trim();
  if (!key) throw new Error("groq_not_configured");
  const fd = new FormData();
  fd.append("file", new Blob([Buffer.from(wavBase64, "base64")], { type: "audio/wav" }), "note.wav");
  fd.append("response_format", "json");
  let last;
  for (const model of [...new Set([process.env.GROQ_WHISPER_MODEL, "whisper-large-v3-turbo", "whisper-large-v3"].filter(Boolean))]) {
    if (left() < 4000) break;
    fd.set("model", model);
    const to = withTimeout(cap(15000));
    try {
      const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", body: fd, signal: to.signal, headers: { authorization: "Bearer " + key } });
      if (r.ok) return (await r.json()).text || "";
      last = await groqError(r, "groq_whisper");
      if (r.status === 401 || r.status === 403) throw last;
    } catch (e) { last = e; if (/_http_(401|403)/.test(e.message)) throw e; }
    finally { to.done(); }
  }
  throw last || new Error("groq_whisper_failed");
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
    console.error("gemini audio failed, trying groq:", e.message);
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
    console.error("gemini text failed, trying groq:", e.message);
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
  try { out = parseJSON(await gemini([{ text: prompt }], { temperature: 0.8, timeout: 18000 })); }
  catch (e) {
    if (e instanceof Blocked) throw e;
    out = parseJSON(await groqChat(prompt, { temperature: 0.8, timeout: 15000 }));
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
const okText = (...t) => !checkText(t.filter(Boolean).join(" "));

async function getJSON(url, headers = {}) {
  const to = withTimeout(5000);
  try { const r = await fetch(url, { headers, signal: to.signal }); return r.ok ? await r.json() : null; }
  catch { return null; } finally { to.done(); }
}

// Unsplash (key UNSPLASH_ACCESS_KEY). Hotlinked, credited, download event reported.
async function fromUnsplash(q, key) {
  const d = await getJSON(`https://api.unsplash.com/search/photos?per_page=5&orientation=landscape&content_filter=high&query=${encodeURIComponent(q)}`, { authorization: `Client-ID ${key}`, "accept-version": "v1" });
  const p = (d?.results || []).find(x => okText(x.alt_description, x.description));
  if (!p) return null;
  if (p.links?.download_location) fetch(`${p.links.download_location}${p.links.download_location.includes("?") ? "&" : "?"}client_id=${key}`).catch(() => {});
  return { src: `${p.urls.raw}&w=1080&h=720&fit=crop&auto=format&q=75`, color: p.color || null, alt: String(p.alt_description || q).slice(0, 140),
    credit: String(p.user?.name || "Unsplash").slice(0, 60), profile: `${p.user?.links?.html || "https://unsplash.com"}?${UTM}`,
    source: "Unsplash", sourceUrl: `https://unsplash.com/?${UTM}`, url: `${p.links?.html || "https://unsplash.com"}?${UTM}`, ttl: 7 };
}

// Pixabay (key PIXABAY_API_KEY, free and instant). Safe search on; image links last 24 h, so cache 1 day.
async function fromPixabay(q, key) {
  const d = await getJSON(`https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=5&min_width=1000`);
  const p = (d?.hits || []).find(x => okText(x.tags));
  if (!p) return null;
  return { src: p.largeImageURL || p.webformatURL, color: null, alt: String(p.tags || q).slice(0, 140), credit: String(p.user || "Pixabay").slice(0, 60),
    profile: `https://pixabay.com/users/${encodeURIComponent(p.user || "")}-${p.user_id || ""}/`, source: "Pixabay", sourceUrl: "https://pixabay.com/", url: p.pageURL || "https://pixabay.com/", ttl: 1 };
}

// Openverse (no key at all). Openly licensed images, mature content excluded; credit + licence shown.
async function fromOpenverse(q) {
  const d = await getJSON(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=8&mature=false&aspect_ratio=wide&size=large`, { "user-agent": "Tangent/1.0 (experimental)" });
  const p = (d?.results || []).find(x => x.url && !x.mature && /^https:/.test(x.url) && okText(x.title, ...(x.tags || []).map(t => t.name)));
  if (!p) return null;
  const lic = `${String(p.license || "").toUpperCase()} ${p.license_version || ""}`.trim();
  return { src: p.url, color: null, alt: String(p.title || q).slice(0, 140), credit: String(p.creator || "Openverse").slice(0, 60) + (lic ? ` · ${lic}` : ""),
    profile: p.creator_url || p.foreign_landing_url || "https://openverse.org/", source: "Openverse", sourceUrl: p.license_url || "https://openverse.org/", url: p.foreign_landing_url || "https://openverse.org/", ttl: 7 };
}

async function photoFor(query) {
  const q = String(query || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  if (!q) return null;
  const env = k => (process.env[k] || "").trim();
  const chain = [
    env("UNSPLASH_ACCESS_KEY") && (() => fromUnsplash(q, env("UNSPLASH_ACCESS_KEY"))),
    env("PIXABAY_API_KEY") && (() => fromPixabay(q, env("PIXABAY_API_KEY"))),
    () => fromOpenverse(q),
  ].filter(Boolean);
  const cache = photoCache();
  try { const hit = cache && await cache.get(q, { type: "json" }); if (hit && Date.now() - hit.at < (hit.photo?.ttl || 1) * 864e5) return hit.photo; } catch {}
  let photo = null;
  for (const get of chain) { try { photo = await get(); } catch { photo = null; } if (photo) break; }
  try { if (cache && photo) await cache.setJSON(q, { at: Date.now(), photo }); } catch {}
  return photo;
}

// One real photo per tile (null where none): Unsplash, then Pixabay, then Openverse. Drawings fill any gap.
export async function findPhotos(queries) {
  if (!queries?.length) return [];
  const photos = await Promise.all(queries.map(photoFor));
  const seen = new Set();
  return photos.map(p => (p && !seen.has(p.src) && seen.add(p.src) ? (({ ttl, ...rest }) => rest)(p) : null));
}

// Health check without secrets: which keys exist and whether Gemini answers.
export async function health() {
  const has = k => Boolean((process.env[k] || "").trim());
  const out = { gemini_key: has("GEMINI_API_KEY"), groq_key: has("GROQ_API_KEY"), unsplash_key: has("UNSPLASH_ACCESS_KEY"), pixabay_key: has("PIXABAY_API_KEY"), photos: has("UNSPLASH_ACCESS_KEY") ? "unsplash" : has("PIXABAY_API_KEY") ? "pixabay" : "openverse (no key)", salt: has("TANGENT_SALT"), stats_token: has("STATS_TOKEN"), gemini: "skipped" };
  if (out.groq_key) { try { parseJSON(await groqChat('Return {"ok": true} as JSON.', { timeout: 15000 })); out.groq = "ok"; } catch (e) { out.groq = String(e.message).slice(0, 200); } } else out.groq = "skipped";
  if (out.gemini_key) { try { await gemini([{ text: 'Reply with {"ok":true}' }], { timeout: 15000 }); out.gemini = "ok"; } catch (e) { out.gemini = String(e.message).replace(/key=[^&\s]+/g, "key=…").slice(0, 200); } }
  return out;
}
