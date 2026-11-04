// POST /api/event { type } -> anonymous daily counter for the owner's stats. No ids are stored.
import { track, json } from "./_lib/guard.mjs";

export default async req => {
  if (req.method !== "POST") return json(405, { status: "error" });
  try { const { type } = await req.json(); await track(String(type || "")); } catch {}
  return json(200, { status: "ok" });
};

export const config = { path: "/api/event" };
