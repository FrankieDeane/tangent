// Mercado Pago subscriptions (preapproval). Mercado Pago Argentina charges in pesos:
// MP_PRICE_ARS is the monthly amount equivalent to 1 USD, set by the owner in Netlify.
import { createHmac, timingSafeEqual } from "node:crypto";
const API = "https://api.mercadopago.com";
const token = () => (process.env.MP_ACCESS_TOKEN || "").trim();
export const mpConfigured = () => Boolean(token() && Number(process.env.MP_PRICE_ARS) > 0);

async function mp(path, init = {}) {
  const r = await fetch(API + path, { ...init, headers: { authorization: "Bearer " + token(), "content-type": "application/json", ...(init.headers || {}) }, signal: AbortSignal.timeout(9000) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`mp_http_${r.status}: ${String(data?.message || "").slice(0, 160)}`);
  return data;
}

export function createPreapproval({ userId, email, siteUrl }) {
  return mp("/preapproval", { method: "POST", body: JSON.stringify({
    reason: "Tangent · cuenta mensual",
    external_reference: userId,
    payer_email: email,
    back_url: siteUrl + "/?pago=ok",
    status: "pending",
    auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: Number(process.env.MP_PRICE_ARS), currency_id: "ARS" },
  }) });
}
export const getPreapproval = id => mp("/preapproval/" + encodeURIComponent(id));
export const getAuthorizedPayment = id => mp("/authorized_payments/" + encodeURIComponent(id));
export const cancelPreapproval = id => mp("/preapproval/" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });

// Mercado Pago -> our plan status
export function planFromMp(status) {
  return { authorized: "active", paused: "past_due", cancelled: "canceled", pending: "free" }[status] || "free";
}

// x-signature: "ts=...,v1=..."; manifest "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
export function validSignature(req, dataId) {
  const secret = (process.env.MP_WEBHOOK_SECRET || "").trim();
  if (!secret) return false;
  const sig = req.headers.get("x-signature") || "", reqId = req.headers.get("x-request-id") || "";
  const parts = Object.fromEntries(sig.split(",").map(p => p.trim().split("=")).filter(p => p.length === 2));
  if (!parts.ts || !parts.v1) return false;
  const id = /^[a-z0-9]+$/i.test(dataId) ? String(dataId).toLowerCase() : dataId;
  let manifest = "";
  if (id) manifest += `id:${id};`;
  if (reqId) manifest += `request-id:${reqId};`;
  manifest += `ts:${parts.ts};`;
  const want = createHmac("sha256", secret).update(manifest).digest("hex");
  try { return timingSafeEqual(Buffer.from(want), Buffer.from(parts.v1)); } catch { return false; }
}
