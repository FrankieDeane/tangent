// Tangent content rules. This file is the heart of the site:
// every request and every AI answer passes through it.
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

export const DAILY_LIMIT = Number(process.env.TANGENT_DAILY_LIMIT || 20);
export const STRIKES_TO_BAN = 2;

// ---------- text normalisation ----------
export function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")      // remove accents
    .replace(/[@4]/g, "a").replace(/3/g, "e").replace(/[1!|]/g, "i")
    .replace(/0/g, "o").replace(/[5$]/g, "s").replace(/7/g, "t")
    .replace(/[*_.\-]/g, "")                                 // f*ck, f.u.c.k
    .replace(/(.)\1{2,}/g, "$1$1")                           // fuuuuck -> fuuck
    .replace(/\s+/g, " ")
    .trim();
}

// Rules: "stem" matches the start of a word (violen -> violencia, violence).
// "=word" matches only that exact word. Entries with spaces are phrases.
const LISTS = {
  selfharm: [
    "suicid", "kill myself", "end my life", "want to die", "wanna die", "self harm", "selfharm", "cut myself", "hurt myself", "better off dead",
    "matarme", "suicidarme", "quitarme la vida", "no quiero vivir", "quiero morir", "cortarme las venas", "autolesion", "lastimarme", "hacerme dano",
  ],
  minors: ["pedophil", "paedophil", "pedofil", "pederast", "child porn", "underage", "=loli", "menor desnud", "menores desnud", "abuso infantil", "child abuse"],
  sexual: [
    "sex", "porn", "nude", "naked", "erotic", "orgasm", "horny", "masturb", "blowjob", "handjob", "=anal", "penis", "vagina", "=boob", "=boobs", "=tits",
    "nsfw", "onlyfans", "fetish", "bdsm", "hentai", "=milf", "dildo", "condom", "sexting", "doggy style", "69 position",
    "porno", "desnud", "orgasm", "cachond", "=pene", "vagin", "teta", "=culo", "coger", "cogid", "garch", "=pete", "pajer", "=paja",
    "chupal", "concha", "pija", "verga", "poronga", "prostitu", "puta", "puto", "trola", "kamasutra", "posicion sexual", "posiciones sexuales",
  ],
  violence: [
    "kill", "murder", "rape", "=stab", "stabbed", "stabbing", "=bomb", "=bombs", "bombing", "terroris", "weapon", "=gun", "=guns", "gunshot", "massacre",
    "torture", "behead", "assault", "beat up", "punch him", "punch her", "shoot him", "shoot her", "shoot people", "school shooting",
    "matar", "=mato", "asesin", "violar", "violaci", "violen", "disparar", "disparo", "balazo", "apunal", "cuchillad", "=bomba", "=bombas",
    "=arma", "=armas", "masacre", "tortur", "golpear", "pegarle", "trompada", "secuestr", "kidnap", "agresi", "aggress",
  ],
  war: ["=war", "warfare", "invasion", "genocid", "guerra", "bombarde", "militar"],
  hate: [
    "nigger", "nigga", "faggot", "=fag", "retard", "nazi", "hitler", "=kkk", "white power", "=heil", "tranny", "=chink", "=spic", "=kike",
    "negro de mierda", "negros de mierda", "maric", "trolo", "sudaca", "mogolic", "retrasad", "judio de mierda", "racis",
  ],
  politics: [
    "politic", "president", "election", "elecciones", "eleccion", "vote for", "votar", "senat", "congres", "parliament", "parlament", "governm", "gobierno",
    "democrat", "republican", "communis", "comunis", "socialis", "fascis", "kirchner", "peronis", "=peron", "milei", "macri", "trump", "biden", "obama", "putin", "zelensk",
    "libertari", "izquierdis", "derechis", "dictadur", "dictator", "partido politico",
  ],
  abortion: ["abort", "aborto", "abortar"],
  death: ["death", "=dead", "dying", "=die", "=died", "=dies", "corpse", "funeral", "muerte", "muerto", "muerta", "morir", "cadaver", "fallec", "velorio", "entierro"],
  drugs: ["cocain", "heroin", "=meth", "fentanyl", "falopa", "=merca"],
  profanity: [
    "fuck", "=fck", "=fuk", "shit", "bitch", "cunt", "asshole", "bastard", "whore", "slut", "=dick", "pussy", "motherf", "=wtf", "=stfu", "damn",
    "hijo de puta", "hijo de re puta", "=hdp", "mierda", "carajo", "pelotud", "forro", "conchud", "la concha", "culiao", "culiado", "chupame",
    "cagar", "=cago", "=orto", "ojete", "imbecil", "idiota", "estupid", "pendej", "cabron", "gilipollas", "joder", "=cono",
  ],
};
// Whole words that a stem would catch but are harmless.
const ALLOW_SET = new Set(["militante", "militantes", "sexta", "sexto", "sextas", "sextos", "sextet", "tetera", "teteras", "pijama", "pijamas", "pedal"]);

function hits(text, list) {
  const t = " " + normalize(text).replace(/[^a-z0-9 ]/g, " ") + " ";
  const words = t.trim().split(/\s+/);
  for (const entry of list) {
    if (entry.includes(" ")) { if (t.includes(" " + entry + " ") || t.includes(" " + entry)) return entry; continue; }
    if (entry.startsWith("=")) { if (words.includes(entry.slice(1))) return entry.slice(1); continue; }
    const w = words.find(x => x.startsWith(entry) && !ALLOW_SET.has(x));
    if (w) return entry;
  }
  return null;
}

// Returns {category, term} for the first rule broken, or null.
export function checkText(text) {
  if (!text) return null;
  for (const cat of ["selfharm", "minors", "sexual", "violence", "war", "hate", "politics", "abortion", "death", "drugs", "profanity"]) {
    const term = hits(text, LISTS[cat]);
    if (term) return { category: cat, term };
  }
  return null;
}

// ---------- identity (anonymous) ----------
export function hashId(value) {
  const salt = process.env.TANGENT_SALT || "tangent-default-salt-change-me";
  return createHash("sha256").update(salt + "|" + String(value || "")).digest("hex").slice(0, 32);
}

export function identify(req, context, deviceId) {
  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const dev = /^[a-zA-Z0-9-]{8,64}$/.test(deviceId || "") ? deviceId : "no-device";
  return { dev: hashId("d:" + dev), ip: hashId("i:" + ip) };
}

// ---------- storage ----------
const guard = () => getStore({ name: "tangent-guard", consistency: "strong" });
const usage = () => getStore({ name: "tangent-usage", consistency: "strong" });
export const today = () => new Date().toISOString().slice(0, 10);

export async function isBanned(id) {
  const g = guard();
  const [a, b] = await Promise.all([g.get("ban:" + id.dev, { type: "json" }), g.get("ban:" + id.ip, { type: "json" })]);
  return Boolean(a?.banned || b?.banned);
}

// Adds a strike to this device and connection. Returns the new strike count.
export async function addStrike(id, category) {
  const g = guard();
  const [a, b] = await Promise.all([g.get("ban:" + id.dev, { type: "json" }), g.get("ban:" + id.ip, { type: "json" })]);
  const strikes = Math.max(a?.strikes || 0, b?.strikes || 0) + 1;
  const rec = { strikes, banned: strikes >= STRIKES_TO_BAN, last: category, at: new Date().toISOString() };
  await Promise.all([g.setJSON("ban:" + id.dev, rec), g.setJSON("ban:" + id.ip, rec)]);
  await bump("violations:" + today());
  return strikes;
}

export async function underLimit(id, kind = "rec") {
  const u = usage();
  const d = today();
  const [a, b] = await Promise.all([u.get(`${d}:${kind}:${id.dev}`, { type: "json" }), u.get(`${d}:${kind}:${id.ip}`, { type: "json" })]);
  const limit = kind === "rec" ? DAILY_LIMIT : DAILY_LIMIT + 10;
  return Math.max(a?.n || 0, b?.n || 0) < limit;
}

export async function countUse(id, kind = "rec") {
  const u = usage();
  const d = today();
  const inc = async key => { const v = await u.get(key, { type: "json" }); await u.setJSON(key, { n: (v?.n || 0) + 1 }); };
  await Promise.all([inc(`${d}:${kind}:${id.dev}`), inc(`${d}:${kind}:${id.ip}`), inc(`total:${kind}:${d}`)]);
}

async function bump(key) {
  const u = usage();
  const v = await u.get("total:" + key, { type: "json" });
  await u.setJSON("total:" + key, { n: (v?.n || 0) + 1 });
}

// Anonymous product events, counted per day (no ids stored).
export const EVENTS = ["visit", "share", "listen", "reminder", "signup", "login", "resume", "park", "same_thread", "replay", "vote_yes", "vote_mid", "vote_no", "say", "ink", "correct", "translate", "spark", "spark_garden", "spark_images"];
export async function track(kind) { if (EVENTS.includes(kind)) await bump(kind + ":" + today()); }

export async function stats(days = 14) {
  const u = usage();
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    const keys = [`total:rec:${d}`, `total:draw:${d}`, `total:violations:${d}`, ...EVENTS.map(e => `total:${e}:${d}`)];
    const vals = await Promise.all(keys.map(k => u.get(k, { type: "json" })));
    const row = { date: d, recordings: vals[0]?.n || 0, drawings: vals[1]?.n || 0, blocked: vals[2]?.n || 0 };
    EVENTS.forEach((e, j) => { row[e] = vals[3 + j]?.n || 0; });
    out.push(row);
  }
  return out;
}

export const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
});
