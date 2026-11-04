// POST /api/draw  { deviceId, subjects: string[], palette: string }
import { checkText, identify, isBanned, underLimit, countUse, json } from "./_lib/guard.mjs";
import { drawSvgs, Blocked, setBudget } from "./_lib/ai.mjs";

const PAL = {
  dawn: ["#FCE6D4", "#F6B99A", "#F28C6B", "#6E5A7E"], mist: ["#E7EEF0", "#C5D6DD", "#8FAAB7", "#3F5866"],
  forest: ["#E6EFE2", "#B8D3B0", "#7FA67A", "#33503A"], sea: ["#E2F1F4", "#A9D8E0", "#5BA8B8", "#1F4E5F"],
  dusk: ["#ECE3F2", "#C9B6DE", "#9479B8", "#3B2F55"], sand: ["#F6EEDD", "#E8D2A8", "#CFA86A", "#5C4A2E"],
};

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body;
  try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "draw"))) return json(429, { status: "limit" });

  const subjects = (Array.isArray(body.subjects) ? body.subjects : []).slice(0, 5).map(s => String(s).slice(0, 120));
  if (!subjects.length || checkText(subjects.join(" \n "))) return json(200, { status: "skip", svgs: [] });

  setBudget(22000);
  try {
    const svgs = await drawSvgs(subjects, PAL[body.palette] || PAL.mist);
    await countUse(id, "draw");
    return json(200, { status: "ok", svgs });
  } catch (e) {
    if (!(e instanceof Blocked)) console.error("draw failed:", e.message);
    return json(200, { status: "skip", svgs: [] });
  }
};

export const config = { path: "/api/draw" };
