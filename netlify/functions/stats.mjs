// GET /api/stats?token=STATS_TOKEN&days=30 -> daily usage for the owner's dashboard (/stats.html).
import { stats, json } from "./_lib/guard.mjs";
import { timingSafeEqual } from "node:crypto";
import { testers } from "./tester.mjs";

export default async req => {
  const expected = process.env.STATS_TOKEN || "";
  const url = new URL(req.url);
  const given = req.headers.get("x-stats-token") || url.searchParams.get("token") || "";
  const ok = expected.length >= 8 && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return json(401, { status: "unauthorized" });
  const n = Math.min(60, Math.max(1, Number(url.searchParams.get("days")) || 30));
  const days = await stats(n);
  const sum = k => days.reduce((a, d) => a + (d[k] || 0), 0);
  const keys = Object.keys(days[0] || {}).filter(k => k !== "date");
  // Test-phase sign-ups (newest first). Only the owner sees this, with the token.
  let list = [];
  try {
    const st = testers(), { blobs } = await st.list({ prefix: "t:" });
    list = (await Promise.all(blobs.slice(0, 500).map(b => st.get(b.key, { type: "json" })))).filter(Boolean).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  } catch { list = []; }
  return json(200, { status: "ok", total: sum("recordings"), totals: Object.fromEntries(keys.map(k => [k, sum(k)])), days, testers: list });
};

export const config = { path: "/api/stats" };
