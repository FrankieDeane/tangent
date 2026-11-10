// POST /api/study-code { deviceId, code } -> { status: "ok" | "bad" }  (school or invitation code)
import { identify, isBanned, underLimit, countUse, json } from "./_lib/guard.mjs";
import { codeOk } from "./_lib/access.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body; try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "code"))) return json(429, { status: "limit" });
  if (codeOk(body.code)) return json(200, { status: "ok" });
  await countUse(id, "code"); // only wrong tries count, so guessing is slow
  return json(200, { status: "bad" });
};

export const config = { path: "/api/study-code" };
