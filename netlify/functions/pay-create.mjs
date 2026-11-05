// POST /api/pay/create { accessToken } -> { url } to Mercado Pago's checkout for the monthly plan.
import { json } from "./_lib/guard.mjs";
import { userFromToken, setSubscription } from "./_lib/supa.mjs";
import { mpConfigured, createPreapproval } from "./_lib/mp.mjs";

export default async (req) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  if (!mpConfigured()) return json(200, { status: "not_ready" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const user = await userFromToken(body.accessToken);
  if (!user) return json(401, { status: "signin" });
  const siteUrl = (process.env.URL || new URL(req.url).origin).replace(/\/+$/, "");
  try {
    const p = await createPreapproval({ userId: user.id, email: user.email, siteUrl });
    await setSubscription(user.id, { provider: "mercadopago", provider_customer_id: p.id, price_cents: 100, currency: "USD" });
    return json(200, { status: "ok", url: p.init_point });
  } catch (e) {
    console.error("mp create failed:", e.message);
    return json(502, { status: "error" });
  }
};
export const config = { path: "/api/pay/create" };
