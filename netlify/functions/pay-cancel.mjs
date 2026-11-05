// POST /api/pay/cancel { accessToken } -> cancels the monthly plan (botón de baja).
import { json } from "./_lib/guard.mjs";
import { userFromToken, subscriptionOf, setSubscription } from "./_lib/supa.mjs";
import { cancelPreapproval } from "./_lib/mp.mjs";

export default async (req) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const user = await userFromToken(body.accessToken);
  if (!user) return json(401, { status: "signin" });
  const sub = await subscriptionOf(user.id);
  try {
    if (sub?.provider === "mercadopago" && sub.provider_customer_id) await cancelPreapproval(sub.provider_customer_id);
    await setSubscription(user.id, { status: "canceled" });
    return json(200, { status: "ok" });
  } catch (e) {
    console.error("mp cancel failed:", e.message);
    return json(502, { status: "error" });
  }
};
export const config = { path: "/api/pay/cancel" };
