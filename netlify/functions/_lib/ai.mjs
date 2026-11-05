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
Precision matters more than poetry: everything you write must come from what the person actually said. Never invent topics, places, people or objects they did not mention.
People with ADHD often jump between unrelated topics in one note (for example a stand-up paddle trip, then new features for an app). First find each separate idea. Never blend two unrelated ideas into one sentence, one step or one picture. List them in "ideas", main one first. When there are 2 or 3 ideas: the core names each one briefly, the summary gives each its own sentence, and every tile and step says which idea it belongs to. A passing remark is a tangent, not an idea.
The person may mix Spanish and English in the same note; that is normal, understand both. Write every text field in the output language given below, except transcript, subject, photo and photo_query.

${RULES}

${source}

Reply with ONLY a JSON object:
{"transcript": "exact transcript of what the person said (for typed text, copy it)",
 "language": "the main spoken language: es|en (a mix of both is fine, pick the main one)|other",
 "safety": {"ok": true or false, "topic": "none|sexual|minors|violence|war|hate|politics|abortion|death|selfharm|drugs|profanity|other"},
 "ideas": [1 to 3 objects, one per separate idea the person talked about, main idea first: {"title": "max 5 words, in the output language", "line": "max 16 words, second person, in the output language: what they want with this idea"}],
 "core": "the core idea in one or two short sentences, max 22 words, second person, calm, in the output language",
 "summary": "a faithful synthesis of everything they said, 2 or 3 short sentences, max 55 words, second person, in the output language, keeping their own key words",
 "mood": "one of ${MOODS.join("|")}",
 "palette": "one of ${PALETTES.join("|")} matching the mood",
 "tiles": [5 visual memory anchors, in the order the ideas came up. Each one stands for ONE concrete part of what they said, so that remembering the picture brings back that part of the idea. Object {"subject": "the literal thing, place or action they mentioned for this part, 4-10 words in English, no metaphors", "photo": "2 or 3 literal English nouns that a stock photo site would match exactly for that same thing, e.g. 'guest list notebook', 'workshop tools table'; never abstract words like idea, success, focus, mind, future", "scene": "closest of ${SCENES.join("|")}", "caption": "max 7 words in the output language: the part of the idea this picture helps remember", "idea": index in "ideas" of the idea this picture belongs to}],
 "mix": {"focus": 0-100, "energy": 0-100, "calm": 0-100, "urgency": 0-100, "clarity": 0-100, "ideas": 0-100} estimated from how they spoke (ideas = how many separate ideas came up),
 "clip": "index 0-4 of the tile that best captures the whole idea",
 "breathe": "one calming line, max 14 words, only if they sound stressed or overwhelmed, else empty string",
 "steps": [3 objects {"when": "short time like 7:00, Hoy/Today, Después/Next", "what": "a concrete action, max 7 words, starting with a verb", "idea": index in "ideas" it moves forward}],
 "keep": [3 to 6 single key words copied exactly from the transcript],
 "letgo": [3 to 6 short noisy phrases copied from the transcript that can be set aside],
 "tangents": [0 to 3 side ideas they mentioned that are not the core, max 5 words each],
 "spark": {"jumps": [the 2 to 5 topics the person jumped between, in the order they came up, 1 to 3 words each, in the output language; empty array if they stayed on one topic], "link": "the hidden thread that joins those jumps, the thing they have in common that the person probably did not notice, max 14 words, in the output language; empty if there were no jumps", "idea": "one original, concrete idea that only appears when you join those jumps, max 26 words, second person, in the output language. It may be new, but it must be built only from the topics they mentioned; empty if there were no jumps"},
 "sounds": [1 to 3 of ${SOUNDS.join("|")} that fit the scenes they imagined or would calm them],
 "photo_query": "2 or 3 English words for a calm, safe stock photo that fits the core",
 "strength": {"name": "the ADHD strength this note shows, 1 to 3 words in the output language, e.g. Conectar ideas / Connecting ideas, Hiperfoco / Hyperfocus, Creatividad / Creativity, Energía / Energy, Curiosidad / Curiosity, Visión amplia / Big-picture thinking, Intuición / Intuition", "how": "max 20 words, second person, warm: how this strength helps make this exact idea clear and doable"},
 "brain": {"region": "the brain area most involved in this kind of thinking, one of prefrontal (planning, deciding, ordering), motor (doing, acting, building), parietal (connecting pieces, space, numbers), temporal (words, memory, stories, people), occipital (images, imagining, visual ideas), limbic (emotion, motivation, what matters to them)", "why": "max 24 words, second person, warm, in the output language: what that area is doing in this idea and why that is a strength, even with ADHD. Illustrative, never medical or diagnostic"},
 "same_thread": true if a previous idea is given below and this note clearly continues it, else false}
If safety.ok is false or language is "other", still return the JSON but leave core, tiles, steps and the rest empty.`;
}

const prevLine = prev => (prev ? `\nTheir previous idea, a little while ago, was: """${String(prev).slice(0, 220)}""". Use it only to decide same_thread.` : "");
// Extra context for one reading: output language, what this person taught Tangent before, and a correction of the last reading.
function context(c = {}) {
  const out = c.lang === "en" ? "English" : "Spanish from Argentina (natural voseo)";
  return prevLine(c.prev)
    + `\nOutput language: ${out}.`
    + (c.notes ? `\nWhat this person taught you before about how to read them (follow it when it applies, never copy it into the board): """${String(c.notes).slice(0, 700)}"""` : "")
    + (c.correction ? `\nIMPORTANT: the person says your previous reading of this same note was wrong. Their correction: """${String(c.correction).slice(0, 300)}""". Rebuild the whole board so it follows the correction exactly.` : "");
}

export async function analyzeAudio(wavBase64, ctx = {}) {
  const prompt = boardPrompt("The voice note is attached as audio. Transcribe it word for word in the language(s) actually spoken, then analyse it." + context(ctx));
  try {
    return { ...parseJSON(await gemini([{ inline_data: { mime_type: "audio/wav", data: wavBase64 } }, { text: prompt }], { temperature: 0.4 })), provider: "gemini" };
  } catch (e) {
    if (e instanceof Blocked) throw e;
    console.error("gemini audio failed, trying groq:", e.message);
    const transcript = await groqTranscribe(wavBase64);
    return analyzeTextWithGroq(transcript, ctx);
  }
}

export async function analyzeText(text, ctx = {}) {
  const prompt = boardPrompt(`Voice note transcript: """${text.slice(0, 4000)}"""` + context(ctx));
  try {
    return { ...parseJSON(await gemini([{ text: prompt }], { temperature: 0.4 })), provider: "gemini" };
  } catch (e) {
    if (e instanceof Blocked) throw e;
    console.error("gemini text failed, trying groq:", e.message);
    return analyzeTextWithGroq(text, ctx);
  }
}

async function analyzeTextWithGroq(text, ctx = {}) {
  const prompt = boardPrompt(`Voice note transcript: """${String(text).slice(0, 4000)}"""` + context(ctx));
  const out = parseJSON(await groqChat(prompt, { temperature: 0.4 }));
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

// "Say it to someone": turn a board into a short message the person can send.
const AUDIENCES = {
  boss: "their boss or a client: professional, concise, confident",
  partner: "their partner or family: warm, simple, no jargon",
  team: "their team or colleagues: clear, friendly, with the next step",
  friend: "a friend: casual and natural",
};
export const AUDIENCE_KEYS = Object.keys(AUDIENCES);
export async function writeMessage(board, to, language) {
  const es = language !== "en";
  const prompt = `A person with ADHD has an idea and wants to explain it clearly to ${AUDIENCES[to] || AUDIENCES.friend}.
Write the message they will send, in their own voice (first person), in ${es ? "Spanish from Argentina (voseo, natural, not formal Spain Spanish)" : "English"}.
Exactly 3 short lines, at most 60 words in total: line 1 says the idea, line 2 why it matters or what it needs, line 3 a concrete next step or a clear ask.
Use only what is in the idea below. Never invent names, dates, numbers or facts. No greeting, no sign-off, no hashtags, no emojis, no quotes.
Keep it wholesome: nothing about sex, violence, politics, death, drugs or insults.
Idea: """${String(board.core || "").slice(0, 220)}"""
Summary: """${String(board.summary || "").slice(0, 420)}"""
Steps: ${(board.steps || []).map(s => s.what).join("; ").slice(0, 300)}
Reply with ONLY a JSON object {"message": "line 1\\nline 2\\nline 3"}.`;
  let out;
  try { out = parseJSON(await gemini([{ text: prompt }], { temperature: 0.6, timeout: 15000 })); }
  catch (e) {
    if (e instanceof Blocked) throw e;
    console.error("gemini say failed, trying groq:", e.message);
    out = parseJSON(await groqChat(prompt, { temperature: 0.6, timeout: 12000 }));
  }
  return String(out?.message || "").replace(/\r/g, "").split("\n").map(l => l.trim()).filter(Boolean).slice(0, 3).join("\n").slice(0, 480);
}

// Translate a board's visible text to the other language (the board was already checked when it was made).
export async function translateBoard(fields, to) {
  const target = to === "en" ? "English" : "Spanish from Argentina (natural voseo)";
  const prompt = `Translate every string value of this JSON object into ${target}. Keep the meaning, tone and length; keep the same keys, array lengths and order; do not add or drop anything. Proper names stay as they are.
${JSON.stringify(fields)}
Reply with ONLY the translated JSON object.`;
  try { return parseJSON(await gemini([{ text: prompt }], { temperature: 0.2, timeout: 15000 })); }
  catch (e) {
    if (e instanceof Blocked) throw e;
    console.error("gemini translate failed, trying groq:", e.message);
    return parseJSON(await groqChat(prompt, { temperature: 0.2, timeout: 12000 }));
  }
}


// ---------- The Spark: an ADHD brain jumps between things; Tangent finds the hidden thread ----------
const sparkLang = l => (l === "en" ? "English" : "Spanish from Argentina (natural voseo)");
const SPARK_RULES = `Keep it wholesome and calm: nothing about sex, nudity, violence, weapons, war, hate, politics, abortion, death, self-harm, drugs or insults.`;

// Across recordings: find what links ideas recorded on different days.
export async function sparkGarden(items, lang) {
  const list = items.map((x, i) => `${i}: [${x.ago}] ${x.core}${x.tangents.length ? ` (side ideas: ${x.tangents.join("; ")})` : ""}`).join("\n");
  const prompt = `A person with ADHD records rambling voice notes with Tangent. Below are the core ideas (and side ideas) of their past notes, recorded at different times. ADHD brains jump between topics; those jumps are divergent thinking, joining things nobody else joins.
Find the most surprising but real connection between 2 to 4 of these notes, ideally recorded on different days and about seemingly unrelated topics. Then turn it into one original idea that only exists when you join them.
Rules: use only what is in the notes; never invent people, places, numbers or facts. Be warm, brief, second person, in ${sparkLang(lang)}. ${SPARK_RULES}
Notes:
${list}
Reply with ONLY a JSON object:
{"from": [indexes of the 2 to 4 notes you connected],
 "labels": [one label per connected note, same order, 1 to 3 words each],
 "link": "the hidden thread they share, max 14 words",
 "idea": "the original idea born from joining them, max 30 words",
 "step": "one tiny first step to try this idea, max 9 words, starting with a verb",
 "pattern": "the name of the thinking pattern you saw, 1 to 3 words, e.g. Same problem, different places / Mismo problema, distintos lugares"}`;
  try { return parseJSON(await gemini([{ text: prompt }], { temperature: 0.9, timeout: 20000 })); }
  catch (e) {
    if (e instanceof Blocked) throw e;
    console.error("gemini spark failed, trying groq:", e.message);
    return parseJSON(await groqChat(prompt, { temperature: 0.9, timeout: 15000 }));
  }
}

// From things the person uploads (photos, screenshots, odd charts, drawings): see the pattern an ADHD eye sees.
export async function sparkImages(images, ideas, lang) {
  const prompt = `A person with ADHD uploaded ${images.length} images to Tangent: photos, screenshots, charts or drawings that may look unrelated or even make no sense to other people. ADHD brains notice patterns others miss: shapes, rhythms, colours, numbers, moods, repetitions, contradictions.
First check safety. Mark safety.ok false if any image shows nudity or sexual content, minors in any unsafe context, violence, blood, weapons, war, hate symbols, political content, drugs, death or self-harm.
Then look closely at each image and find the hidden pattern that connects them, the one a person with ADHD would see and others would not. If you can, link that pattern to one of their recent ideas listed below. Then give one original idea that comes from that pattern.
Rules: describe only what is really visible; never identify real people or read private data out loud. Be warm, brief, second person, in ${sparkLang(lang)}. ${SPARK_RULES}
${ideas.length ? `Their recent ideas:\n${ideas.map((x, i) => `${i}: ${x}`).join("\n")}` : "They have no recent ideas yet."}
Reply with ONLY a JSON object:
{"safety": {"ok": true or false, "topic": "none|sexual|minors|violence|war|hate|politics|drugs|death|selfharm|other"},
 "see": [one per image, in order: what you notice in it that matters for the pattern, max 9 words],
 "pattern": "the hidden pattern that joins all the images, max 18 words",
 "name": "a short name for that pattern, 1 to 3 words",
 "link": "how it connects to one of their recent ideas, max 18 words, or empty string",
 "idea": "an original idea born from this pattern, max 30 words",
 "step": "one tiny first step, max 9 words, starting with a verb"}`;
  const parts = [...images.map(data => ({ inline_data: { mime_type: "image/jpeg", data } })), { text: prompt }];
  return parseJSON(await gemini(parts, { temperature: 0.8, timeout: 24000 }));
}

// ---------- Burbujas: voice note -> tasks ----------
// Contract: /mnt/project-files/tangent/mvp/ai_contract.md. Priority only from the person's own words, never from tone.
function tasksPrompt(source, lang) {
  const out = lang === "en" ? "English" : "Spanish from Argentina (natural voseo)";
  return `You help a person with ADHD. They recorded a messy voice note with things they have to do. Split it into separate tasks.
Everything must come from what they actually said. Never invent tasks, people, places or dates.
${RULES}

${source}
Output language for title, summary and emergency_steps: ${out}. raw_quote stays exactly in the spoken language.

Rules:
- At most 7 tasks. If there are more, group related ones.
- title: 2 to 4 words, max 32 characters. It is read inside a bubble.
- summary: one clear sentence, no filler words, with the what and the when if they said it.
- raw_quote: the exact phrase from the transcript this task came from.
- priority: "alta", "media" or "baja" ONLY if the person said it with words (e.g. "urgente", "hoy sí o sí", "me pesa", "es importante" = alta; "esta semana", "en algún momento pronto" = media; "tranqui", "cuando pueda", "no hay apuro" = baja; same in English). If they did not say it, null. NEVER infer it from tone of voice, emotions, volume or how often they repeat it.
- priority_cue: the exact word(s) that justified the priority, copied from the transcript, or null.
- icon: one of send|shirt|phone|bolt|run|cart|home|mail|calendar|money|doc|heart|car|book|food|work|clean|plant|pet|health|other.
- emergency_steps: two tiny physical actions of under 10 seconds that need no decision. Each starts with a verb in the imperative (voseo in Spanish: "Abrí", "Tocá", "Escribí solo"). The second one is even easier than the first.

Reply with ONLY a JSON object:
{"transcript": "exact transcript of what the person said",
 "language": "es|en|other",
 "safety": {"ok": true or false, "topic": "none|sexual|minors|violence|war|hate|politics|abortion|death|selfharm|drugs|profanity|other"},
 "tasks": [{"title": "", "summary": "", "raw_quote": "", "icon": "", "priority": "alta|media|baja|null", "priority_cue": "or null", "emergency_steps": ["", ""]}]}
If safety.ok is false or language is "other", still return the JSON with an empty tasks array.`;
}

export async function tasksAudio(wavBase64, lang) {
  const prompt = tasksPrompt("The voice note is attached as audio. Transcribe it word for word in the language actually spoken, then split it.", lang);
  try {
    return { ...parseJSON(await gemini([{ inline_data: { mime_type: "audio/wav", data: wavBase64 } }, { text: prompt }], { temperature: 0.2 })), provider: "gemini" };
  } catch (e) {
    if (e instanceof Blocked) throw e;
    console.error("gemini tasks audio failed, trying groq:", e.message);
    const transcript = await groqTranscribe(wavBase64);
    return tasksTextGroq(transcript, lang);
  }
}

export async function tasksText(text, lang) {
  const prompt = tasksPrompt(`Voice note transcript: """${String(text).slice(0, 4000)}"""`, lang);
  try { return { ...parseJSON(await gemini([{ text: prompt }], { temperature: 0.2 })), provider: "gemini" }; }
  catch (e) {
    if (e instanceof Blocked) throw e;
    console.error("gemini tasks text failed, trying groq:", e.message);
    return tasksTextGroq(text, lang);
  }
}

async function tasksTextGroq(text, lang) {
  const out = parseJSON(await groqChat(tasksPrompt(`Voice note transcript: """${String(text).slice(0, 4000)}"""`, lang), { temperature: 0.2 }));
  if (!out.transcript) out.transcript = text;
  return { ...out, provider: "groq" };
}
