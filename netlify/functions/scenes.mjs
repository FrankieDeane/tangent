// GET /api/scenes -> the three background photos (Día, Noche, Nord) from Unsplash, credited.
// GET /api/scenes?all=1 -> every candidate, for the owner page /fondos.html.
// Pick another photo without touching code: set SCENE_DAY / SCENE_NIGHT / SCENE_NORD in Netlify to an
// Unsplash photo id, optionally with where the person stands: "VfKH-K0H2Ik@0.30,0.62" (x,y from 0 to 1).
import { getStore } from "@netlify/blobs";

const UTM = "utm_source=tangent&utm_medium=referral";
const CANDIDATES = {
  day: ["VfKH-K0H2Ik", "OfbFiJPi9IA", "89RWwE9jrIw", "izpRzDlxDv0"],
  night: ["urwC0b6S_rI", "B9N8Vv55hn4", "rNOGyiFeG38"],
  nord: ["wuW6xjyz6FM", "wAj08mzpyxc", "upGWvDyf7m4"],
};
const ENV = { day: "SCENE_DAY", night: "SCENE_NIGHT", nord: "SCENE_NORD" };
const DEFAULT_FOCUS = [0.32, 0.64];
const json = (status, body, maxAge = 0) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json", "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store" },
});

function choice(mode) {
  const raw = String(process.env[ENV[mode]] || "").trim();
  const [id, at] = raw.split("@");
  const f = (at || "").split(",").map(Number);
  return { id: /^[\w-]{6,20}$/.test(id || "") ? id : CANDIDATES[mode][0], focus: f.length === 2 && f.every(n => n >= 0 && n <= 1) ? f : DEFAULT_FOCUS };
}

async function photo(id, key, cache) {
  try { const hit = cache && await cache.get("p:" + id, { type: "json" }); if (hit && Date.now() - hit.at < 7 * 864e5) return hit.photo; } catch {}
  let p = null;
  try {
    const r = await fetch(`https://api.unsplash.com/photos/${encodeURIComponent(id)}`, { headers: { authorization: `Client-ID ${key}`, "accept-version": "v1" } });
    p = r.ok ? await r.json() : null;
  } catch {}
  if (!p?.urls?.raw) return null;
  // Unsplash asks to report a "download" when a photo is used in the product.
  if (p.links?.download_location) fetch(`${p.links.download_location}${p.links.download_location.includes("?") ? "&" : "?"}client_id=${key}`).catch(() => {});
  const out = {
    id, src: `${p.urls.raw}&w=1080&h=1920&fit=crop&crop=entropy&auto=format&q=78`, wide: `${p.urls.raw}&w=2400&h=1500&fit=crop&crop=entropy&auto=format&q=74`,
    thumb: `${p.urls.raw}&w=160&h=160&fit=crop&auto=format&q=70`, color: p.color || null, alt: String(p.alt_description || "").slice(0, 140),
    credit: String(p.user?.name || "Unsplash").slice(0, 60), profile: `${p.user?.links?.html || "https://unsplash.com"}?${UTM}`,
    page: `${p.links?.html || "https://unsplash.com"}?${UTM}`, sourceUrl: `https://unsplash.com/?${UTM}`,
  };
  try { cache && await cache.setJSON("p:" + id, { at: Date.now(), photo: out }); } catch {}
  return out;
}

export default async req => {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return json(200, { status: "no_key", day: null, night: null, nord: null });
  let cache = null; try { cache = getStore({ name: "tangent-scenes" }); } catch {}
  if (new URL(req.url).searchParams.get("all")) {
    const out = {};
    for (const m of Object.keys(CANDIDATES)) out[m] = (await Promise.all(CANDIDATES[m].map(id => photo(id, key, cache)))).filter(Boolean);
    return json(200, { status: "ok", chosen: { day: choice("day").id, night: choice("night").id, nord: choice("nord").id }, ...out });
  }
  const out = { status: "ok" };
  await Promise.all(Object.keys(CANDIDATES).map(async m => {
    const c = choice(m), p = await photo(c.id, key, cache);
    out[m] = p ? { ...p, focus: c.focus } : null;
  }));
  return json(200, out, 600);
};

export const config = { path: "/api/scenes" };
