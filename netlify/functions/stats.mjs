// GET /api/stats?token=STATS_TOKEN  -> recordings, drawings and blocked attempts for the last 14 days.
import { stats, json } from "./_lib/guard.mjs";
import { timingSafeEqual } from "node:crypto";

export default async req => {
  const expected = process.env.STATS_TOKEN || "";
  const given = new URL(req.url).searchParams.get("token") || "";
  const ok = expected.length >= 8 && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return json(401, { status: "unauthorized" });
  const days = await stats(14);
  return json(200, { status: "ok", total: days.reduce((a, d) => a + d.recordings, 0), days });
};

export const config = { path: "/api/stats" };
