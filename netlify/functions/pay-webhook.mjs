// POST /api/pay/webhook  (Mercado Pago notifications). Signature checked with MP_WEBHOOK_SECRET.
// The plan is always read back from Mercado Pago, never taken from the notification body.
import { json } from "./_lib/guard.mjs";
import { setSubscription } from "./_lib/supa.mjs";
import { validSignature, getPreapproval, getAuthorizedPayment, planFromMp } from "./_lib/mp.mjs";

export default async (req) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  const url = new URL(req.url);
  let body = {}; try { body = await req.json(); } catch {}
  const dataId = url.searchParams.get("data.id") || String(body?.data?.id || "");
  const type = url.searchParams.get("type") || body?.type || "";
  if (!dataId || !validSignature(req, dataId)) return json(401, { status: "bad_signature" });
  try {
    let preId = null;
    if (type === "subscription_preapproval") preId = dataId;
    else if (type === "subscription_authorized_payment") preId = (await getAuthorizedPayment(dataId))?.preapproval_id;
    if (!preId) return json(200, { status: "ignored" });
    const p = await getPreapproval(preId);
    const userId = p.external_reference;
    await setSubscription(userId, {
      status: planFromMp(p.status), provider: "mercadopago", provider_customer_id: p.id,
      current_period_end: p.next_payment_date || null,
    });
    return json(200, { status: "ok" });
  } catch (e) {
    console.error("mp webhook failed:", e.message);
    return json(500, { status: "error" }); // Mercado Pago retries
  }
};
export const config = { path: "/api/pay/webhook" };
