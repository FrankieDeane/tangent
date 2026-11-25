// POST /api/tester { deviceId, nick, email, group, guardian?, note?, terms, news } -> { status }
// Test phase sign-up: anyone can join as a tester. Only what is needed to contact them is kept
// (nickname, email, age group), in the private Netlify Blob store "tangent-testers".
// The owner sees the list in /stats.html with STATS_TOKEN. No profiles, nothing public, nothing shared between users.
import { getStore } from "@netlify/blobs";
import { identify, isBanned, underLimit, countUse, track, checkText, json } from "./_lib/guard.mjs";

const GROUPS = ["kid", "teen", "adult", "uni", "inst"];
const s = (v, n) => String(v ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
const mailOk = m => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m);
export const testers = () => getStore({ name: "tangent-testers", consistency: "strong" });

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "tester"))) return json(429, { status: "limit" });
  const nick = s(body.nick, 30), email = s(body.email, 120).toLowerCase(), group = GROUPS.includes(body.group) ? body.group : "";
  const guardian = s(body.guardian, 120).toLowerCase();
  let note = s(body.note, 300);
  if (!nick || !mailOk(email) || !group) return json(400, { status: "invalid" });
  if (body.terms !== true) return json(400, { status: "terms" });
  // Under 13 is registered by an adult (the email is the adult's); 13 to 17 need an adult's email too.
  if (group === "teen" && (!mailOk(guardian) || guardian === email)) return json(400, { status: "guardian" });
  if (checkText(nick)) return json(400, { status: "blocked" });
  if (checkText(note)) note = "";
  const store = testers(), key = "t:" + email;
  const prev = await store.get(key, { type: "json" });
  await store.setJSON(key, { nick, email, group, guardian: guardian || undefined, note: note || undefined, news: body.news === true, lang: body.lang === "en" ? "en" : "es", at: prev?.at || new Date().toISOString(), seen: new Date().toISOString() });
  await countUse(id, "tester");
  if (!prev) await track("signup");
  return json(200, { status: "ok", again: Boolean(prev) });
};

export const config = { path: "/api/tester" };
