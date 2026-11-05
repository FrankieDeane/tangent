// POST /api/say { deviceId, to: boss|partner|team|friend, lang, board: {core, summary, steps} } -> { message }
// "Say it to someone": a 3-line message the person can send. Same rules as everything else.
import { checkText, identify, isBanned, underLimit, countUse, track, json } from "./_lib/guard.mjs";
import { writeMessage, setBudget, Blocked, AUDIENCE_KEYS } from "./_lib/ai.mjs";

const str = (v, n) => String(v ?? "").slice(0, n);

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { status: "error" });
  let body;
  try { body = await req.json(); } catch { return json(400, { status: "error" }); }
  const id = identify(req, context, body.deviceId);
  if (await isBanned(id)) return json(403, { status: "banned" });
  if (!(await underLimit(id, "say"))) return json(429, { status: "limit" });

  const to = AUDIENCE_KEYS.includes(body.to) ? body.to : "friend";
  const b = body.board || {};
  const board = {
    core: str(b.core, 220), summary: str(b.summary, 420),
    steps: (Array.isArray(b.steps) ? b.steps : []).slice(0, 3).map(s => ({ what: str(s?.what, 80) })),
  };
  if (!board.core) return json(400, { status: "empty" });
  // The board already passed the rules once; check again because it comes from the browser.
  if (checkText([board.core, board.summary, ...board.steps.map(s => s.what)].join(" \n "))) return json(200, { status: "refused" });

  setBudget(22000);
  let message;
  try { message = await writeMessage(board, to, body.lang === "en" ? "en" : "es"); }
  catch (e) {
    if (e instanceof Blocked) return json(200, { status: "refused" });
    console.error("say failed:", e.message);
    return json(502, { status: "ai_error" });
  }
  if (!message || checkText(message)) return json(200, { status: "ai_error" });
  await Promise.all([countUse(id, "say"), track("say")]);
  return json(200, { status: "ok", message });
};

export const config = { path: "/api/say" };
