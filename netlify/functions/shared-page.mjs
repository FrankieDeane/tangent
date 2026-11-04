// GET /s/:id -> read-only page for a shared board, with a preview card for WhatsApp, X, etc.
import { getStore } from "@netlify/blobs";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const L = {
  es: { title: "Una idea en Tangent", power: "Su superpoder", steps: "Próximos pasos", cta: "Grabá la tuya", tag: "Decilo como sale. Miralo claro.", foot: "Una idea de Tangent · Experimental. Las imágenes son interpretaciones.", gone: "Este tablero ya no está disponible." },
  en: { title: "An idea on Tangent", power: "Their superpower", steps: "Next steps", cta: "Record yours", tag: "Say it messy. See it clear.", foot: "An idea by Tangent · Experimental. Images are interpretations.", gone: "This board is no longer available." },
};

export default async (req, context) => {
  const id = (context.params?.id || new URL(req.url).pathname.split("/").pop() || "").toLowerCase();
  const b = /^[a-z0-9]{10}$/.test(id) ? await getStore({ name: "tangent-shares", consistency: "strong" }).get("board:" + id, { type: "json" }) : null;
  const origin = new URL(req.url).origin;
  if (!b) return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tangent</title><body style="font-family:system-ui;background:#ECECEC;display:grid;place-items:center;min-height:100vh;margin:0"><p>${L.es.gone}<br>${L.en.gone}</p><a href="/">Tangent</a></body>`, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  const t = L[b.lang] || L.es, img = `${origin}/api/share/${id}.jpg`;
  const photos = (b.photos || []).map((p, i) => (p ? `<figure class="${i === 0 ? "big" : ""}"><img src="${esc(p.src)}" alt="${esc(p.alt || b.captions?.[i] || "")}" loading="lazy" referrerpolicy="no-referrer"><figcaption>${esc(b.captions?.[i] || "")}<small><a href="${esc(p.profile)}" target="_blank" rel="noopener">${esc(p.credit)}</a> / <a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener">${esc(p.source)}</a></small></figcaption></figure>` : "")).join("");
  const html = `<!doctype html>
<html lang="${b.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(b.core)} · Tangent</title>
<meta name="description" content="${esc(t.tag)}"><meta name="robots" content="noindex, noai, noimageai">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(b.core)}"><meta property="og:description" content="${esc(t.title)} · ${esc(t.tag)}">
<meta property="og:image" content="${img}"><meta property="og:image:width" content="1080"><meta property="og:image:height" content="1350"><meta property="og:url" content="${origin}/s/${id}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${img}">
<link rel="icon" href="/assets/favicon.png"><meta name="theme-color" content="#ECECEC">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap">
<style>
:root{--bg:#ECECEC;--ink:#111;--muted:#6d6d6d;--card:#fff;--line:rgba(0,0,0,.08);--accent:#1463FF;--iris:linear-gradient(135deg,#6A55E0,#8796EE 40%,#A7BDF2 65%,#8EA6EE 85%,#7B8FE8)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Inter Tight",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.w{max-width:980px;margin:0 auto;padding:18px 16px 40px;display:flex;flex-direction:column;gap:18px}
header{display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:4px;color:var(--ink);text-decoration:none}.brand img{height:64px;margin-block:-8px}.brand b{font-weight:800;font-size:26px;letter-spacing:-.05em}
.cta{background:var(--ink);color:#fff;text-decoration:none;border-radius:99px;padding:12px 20px;font-weight:600}
.label{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
h1{font-size:clamp(34px,6vw,64px);line-height:1.02;letter-spacing:-.045em;margin:6px 0 0;font-weight:800}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
figure{margin:0;position:relative;border-radius:22px;overflow:hidden;background:#ddd;aspect-ratio:4/3}figure.big{grid-column:span 2;grid-row:span 2;aspect-ratio:auto}
figure img{width:100%;height:100%;object-fit:cover;display:block}
figcaption{position:absolute;inset:auto 0 0 0;padding:14px;color:#fff;font-weight:600;background:linear-gradient(transparent,rgba(0,0,0,.55));display:flex;flex-direction:column;gap:2px}
figcaption small{font-weight:400;font-size:11px;opacity:.8}figcaption a{color:#fff}
.power{background:var(--iris);color:#fff;border-radius:26px;padding:24px;display:flex;flex-direction:column;gap:6px;box-shadow:0 20px 50px -20px rgba(90,80,220,.6)}
.power b{font-size:30px;letter-spacing:-.03em}.power .label{color:rgba(255,255,255,.8)}
.steps{background:var(--card);border-radius:26px;padding:22px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;border:1px solid var(--line)}
.steps div{display:flex;flex-direction:column;gap:4px}.steps b{font-size:13px;color:var(--accent)}
footer{color:var(--muted);font-size:13px;text-align:center;margin-top:10px}
@media (max-width:700px){.grid{grid-template-columns:1fr 1fr}figure.big{grid-column:span 2;aspect-ratio:4/3}.steps{grid-template-columns:1fr}.brand img{height:52px}}
</style></head><body><div class="w">
<header><a class="brand" href="/"><img src="/assets/mark@3x.webp" alt="" width="332" height="240"><b>Tangent</b></a><a class="cta" href="/">${t.cta}</a></header>
<div><span class="label">${t.title}</span><h1>${esc(b.core)}</h1></div>
${photos ? `<div class="grid">${photos}</div>` : `<img src="${img}" alt="" style="width:100%;max-width:540px;border-radius:26px;margin:auto">`}
${b.strength?.name ? `<div class="power"><span class="label">${t.power}</span><b>${esc(b.strength.name)}</b><span>${esc(b.strength.how)}</span></div>` : ""}
${b.steps?.length ? `<div class="steps">${b.steps.map(s => `<div><b>${esc(s.when)}</b><span>${esc(s.what)}</span></div>`).join("")}</div>` : ""}
<footer>${t.foot}</footer></div></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300", "x-robots-tag": "noindex" } });
};

export const config = { path: "/s/:id" };
