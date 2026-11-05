// Supabase from the server, with plain fetch (no SDK). Keys only come from Netlify env vars and are never returned.
const env = () => ({
  url: (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, ""),
  anon: (process.env.SUPABASE_ANON_KEY || "").trim(),
  service: (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim(),
});
export const supaConfigured = () => { const e = env(); return Boolean(e.url && e.anon); };
export const publicConfig = () => { const e = env(); return e.url && e.anon ? { url: e.url, anon: e.anon } : null; };

const withTimeout = (ms = 6000) => AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined;

// The person behind an access token, or null.
export async function userFromToken(token) {
  const e = env();
  if (!e.url || !e.anon || !token || typeof token !== "string" || token.length > 4000) return null;
  try {
    const r = await fetch(e.url + "/auth/v1/user", { headers: { apikey: e.anon, authorization: "Bearer " + token }, signal: withTimeout() });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.id ? { id: u.id, email: u.email || "" } : null;
  } catch { return null; }
}

// Plan status from public.subscriptions (written only by the server / payments webhook).
export async function planOf(userId) {
  const e = env();
  if (!e.url || !e.service || !/^[0-9a-f-]{36}$/i.test(userId || "")) return "free";
  try {
    const r = await fetch(`${e.url}/rest/v1/subscriptions?user_id=eq.${userId}&select=status`, { headers: { apikey: e.service, authorization: "Bearer " + e.service }, signal: withTimeout() });
    if (!r.ok) return "free";
    const rows = await r.json();
    return rows?.[0]?.status || "free";
  } catch { return "free"; }
}

// Which pieces are in place. Names and yes/no only.
export async function supaCheck() {
  const e = env();
  const out = { SUPABASE_URL: Boolean(e.url), SUPABASE_ANON_KEY: Boolean(e.anon), SUPABASE_SERVICE_ROLE_KEY: Boolean(e.service),
    MP_ACCESS_TOKEN: Boolean((process.env.MP_ACCESS_TOKEN || "").trim()), MP_PRICE_ARS: Number(process.env.MP_PRICE_ARS) > 0, MP_WEBHOOK_SECRET: Boolean((process.env.MP_WEBHOOK_SECRET || "").trim()),
    reachable: false, tables: {} };
  if (!e.url || !e.anon) return out;
  try { const r = await fetch(e.url + "/auth/v1/settings", { headers: { apikey: e.anon }, signal: withTimeout() }); out.reachable = r.ok; out.auth = r.ok ? "ok" : "http_" + r.status; }
  catch (err) { out.auth = "error"; }
  if (!e.service) return out;
  for (const t of ["profiles", "subscriptions", "recordings", "bubbles", "bubble_status_log", "emergency_runs", "focus_sessions", "anon_usage"]) {
    try {
      const r = await fetch(`${e.url}/rest/v1/${t}?select=*&limit=1`, { headers: { apikey: e.service, authorization: "Bearer " + e.service }, signal: withTimeout() });
      out.tables[t] = r.ok ? "ok" : (r.status === 404 ? "missing" : "http_" + r.status);
    } catch { out.tables[t] = "error"; }
  }
  return out;
}

// Writes the plan of one person (server only: payments webhook / cancel).
export async function setSubscription(userId, fields) {
  const e = env();
  if (!e.url || !e.service || !/^[0-9a-f-]{36}$/i.test(userId || "")) return false;
  const r = await fetch(`${e.url}/rest/v1/subscriptions?user_id=eq.${userId}`, {
    method: "PATCH", signal: withTimeout(),
    headers: { apikey: e.service, authorization: "Bearer " + e.service, "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() }),
  });
  return r.ok;
}
export async function subscriptionOf(userId) {
  const e = env();
  if (!e.url || !e.service || !/^[0-9a-f-]{36}$/i.test(userId || "")) return null;
  const r = await fetch(`${e.url}/rest/v1/subscriptions?user_id=eq.${userId}&select=*`, { headers: { apikey: e.service, authorization: "Bearer " + e.service }, signal: withTimeout() });
  return r.ok ? ((await r.json())?.[0] || null) : null;
}
