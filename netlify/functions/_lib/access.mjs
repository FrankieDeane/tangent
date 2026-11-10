// Access codes for Tangent Study while accounts are not wired yet.
// TANGENT_ACCESS_CODES = comma separated codes (schools, invited testers). Never hard-code them here.
import { getStore } from "@netlify/blobs";

const norm = c => String(c || "").trim().toUpperCase().replace(/\s+/g, "");
export function codeOk(code) {
  const list = String(process.env.TANGENT_ACCESS_CODES || "").split(",").map(norm).filter(Boolean);
  const c = norm(code);
  if (!c) return false;
  if (list.includes(c)) return true;
  return Boolean(process.env.STATS_TOKEN) && code === process.env.STATS_TOKEN;
}

// Without a code: one free study per device (same rule as Tangent: one use without an account).
const usage = () => getStore({ name: "tangent-usage", consistency: "strong" });
export const FREE_STUDIES = Number(process.env.TANGENT_FREE_STUDIES || 1);
export async function freeLeft(id) {
  const v = await usage().get("study-free:" + id.dev, { type: "json" });
  return Math.max(0, FREE_STUDIES - (v?.n || 0));
}
export async function useFree(id) {
  const k = "study-free:" + id.dev, u = usage();
  const v = await u.get(k, { type: "json" });
  await u.setJSON(k, { n: (v?.n || 0) + 1, at: new Date().toISOString() });
}
