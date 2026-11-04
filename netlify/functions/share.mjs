// POST /api/share { deviceId, board, image } -> { id, url }   (read-only public link to one board)
// GET  /api/share/:id.jpg                     -> the share card image
import { getStore } from "@netlify/blobs";
import { checkText, identify, isBanned, underLimit, countUse, track, json } from "./_lib/guard.mjs";

const shares = () => getStore({ name: "tangent-shares", consistency: "strong" });
const str = (v, n) => String(v ?? "").slice(0, n);
const MAX_IMG = 1_600_000; // base64 JPEG

function clean(b) {
  const photos = (Array.isArray(b.photos) ? b.photos : []).slice(0, 5).map(p => (p && /^https:\/\//.test(p.src || "") ? {
    src: str(p.src, 400), credit: str(p.credit, 60), profile: /^https:\/\//.test(p.profile || "") ? str(p.profile, 300) : "",
    source: str(p.source, 20), sourceUrl: /^https:\/\//.test(p.sourceUrl || p.url || "") ? str(p.sourceUrl || p.url, 300) : "", alt: str(p.alt, 120),
  } : null));
  return {
    core: str(b.core, 220), lang: b.lang === "en" ? "en" : "es", palette: str(b.palette, 20),
    captions: (Array.isArray(b.tiles) ? b.tiles : []).slice(0, 5).map(t => str(t?.caption, 80)),
    steps: (Array.isArray(b.steps) ? b.steps : []).slice(0, 3).map(s => ({ when: str(s?.when, 24), what: str(s?.what, 80) })),
    strength: { name: str(b.strength?.name, 40), how: str(b.strength?.how, 160) },
    mix: b.mix && typeof b.mix === "object" ? Object.fromEntries(["focus", "energy", "calm", "urgency", "clarity", "ideas"].map(k => [k, Math.max(0, Math.min(100, Number(b.mix[k]) || 0))])) : null,
    photos, at: new Date().toISOString(),
  };
}

export default async (req, context) => {
  const url = new URL(req.url);
  const m = url.pathname.match(/^\/api\/share\/([a-z0-9]{10})\.jpg$/);
  if (req.method === "GET" && m) {
    const img = await shares().get("img:" + m[1], { type: "arrayBuffer" });
    if (!img) return new Response("not found", { status: 404 });
    return new Response(img, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
  }
  if (req.method !== "POST") return json(405, { status: "error" });
  let body;
  try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "share"))) return json(429, { status: "limit" });
  const b = clean(body.board || {});
  const text = [b.core, ...b.captions, ...b.steps.flatMap(s => [s.when, s.what]), b.strength.name, b.strength.how].join(" \n ");
  if (!b.core || checkText(text)) return json(200, { status: "refused" });
  const image = typeof body.image === "string" ? body.image.replace(/^data:image\/jpeg;base64,/, "") : "";
  if (!image || image.length > MAX_IMG || !/^[A-Za-z0-9+/=]+$/.test(image)) return json(400, { status: "bad_image" });
  const key = Array.from(crypto.getRandomValues(new Uint8Array(10)), x => "abcdefghijkmnpqrstuvwxyz23456789"[x % 32]).join("");
  const store = shares();
  await Promise.all([store.setJSON("board:" + key, b), store.set("img:" + key, Buffer.from(image, "base64"))]);
  await Promise.all([countUse(id, "share"), track("share")]);
  return json(200, { status: "ok", id: key, url: `${url.origin}/s/${key}` });
};

export const config = { path: ["/api/share", "/api/share/:file"] };
