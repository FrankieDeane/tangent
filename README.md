# Tangent

Say it messy. See it clear. One button: you talk, Tangent shows a calm visual board (core sentence, images, sounds, three steps). Experimental. Private project, all rights reserved.

## Netlify setup

1. Netlify → Add new site → Import from GitHub → `FrankieDeane/tangent`.
2. Build settings (already in `netlify.toml`): build command empty, publish directory `public`, functions directory `netlify/functions`.
3. Site configuration → Environment variables:

| Variable | Required | What it is |
|---|---|---|
| `GEMINI_API_KEY` | yes | Google AI Studio key (main AI) |
| `GROQ_API_KEY` | recommended | Groq key (free backup if Gemini fails) |
| `TANGENT_SALT` | yes | Any long random text, used to hash device IDs and IPs |
| `STATS_TOKEN` | yes | Any secret of 8+ characters to read `/api/stats?token=...` |
| `PIXABAY_API_KEY` | optional | Free, instant key at pixabay.com/api/docs (log in, the key is shown on that page). Real photos. |
| `UNSPLASH_ACCESS_KEY` | optional | Unsplash Access Key. Used first when present. |
| `GEMINI_MODEL` | optional | Default `gemini-flash-latest` |
| `GROQ_MODEL` | optional | Default `llama-3.3-70b-versatile` |
| `GROQ_WHISPER_MODEL` | optional | Default `whisper-large-v3-turbo` |
| `TANGENT_DAILY_LIMIT` | optional | Ideas per device/IP per day, default 20 |

4. Deploy, then open `/api/health`: it lists which keys exist (never their values) and whether Gemini answers.
5. Netlify Blobs (bans, limits, counters) works automatically.

## How it works

- `public/` static site: `index.html`, `assets/app.js` (mic, WAV conversion, board, garden, postcard, shake), `assets/scenes.js` (built-in drawings), `assets/sounds.js` (ambient sounds).
- `netlify/functions/analyze.mjs` → `/api/analyze`: rules, AI interpretation, safety checks, photos.
- `netlify/functions/draw.mjs` → `/api/draw`: AI drawings for each tile.
- `netlify/functions/stats.mjs` → `/api/stats?token=STATS_TOKEN`: usage counter for the last 14 days.
- `netlify/functions/_lib/guard.mjs`: the rules (prohibited topics, swear words, strikes and bans, daily limits).

## Photos

Each board image is a real photo: Unsplash if its key exists, else Pixabay, else Openverse (openly licensed, needs no key). If none is found, a drawing is used.

## Rules

First prohibited message: session closed with a warning. Second: device and IP blocked. Self-harm talk is never punished; it shows helplines instead.

## Sounds

Recorded sounds can replace the synthesised ones, see `public/assets/sounds/README.md`.


## Accounts, saving and sharing (v2)

- **Accounts are optional.** Sign-in uses Supabase Auth (for now inside the Sliabh Supabase project, tables prefixed `tangent_`).
  The browser uses the project's public publishable key; row-level security keeps every board and audio file private to its owner.
- **Tables:** `tangent_boards`, `tangent_parked`. **Storage bucket:** `tangent-audio` (private, one folder per user).
- **Supabase dashboard, one-time:** Authentication → URL Configuration → Redirect URLs → add `https://tangent-adhd.netlify.app/**`.
  To show a 6-digit code in the emails, add `{{ .Token }}` to the "Confirm signup" and "Reset password" templates.
- **Sharing:** `POST /api/share` stores a read-only copy of the board and its card image in Netlify Blobs (`tangent-shares`); `/s/:id` renders it with a link preview.
- **Owner stats:** open `/stats.html` and enter `STATS_TOKEN`. Counts are anonymous daily totals.
- **Reminders** are calendar events (Google Calendar link or `.ics`), so nothing is stored or sent by Tangent.

## Live ink and "Tell someone" (v4)

- **Live ink**: while recording on a computer, key words float up around the waves using the browser's own speech recognition (Chrome, Edge, Safari on Mac). Phones skip it, because the system can't share the microphone safely with the recording. The words then carry into the "thinking" screen. Event `ink` in stats.
- **Tell someone**: `POST /api/say` turns a board into a 3-line message for a boss/client, partner/family, team or friend. Same rules as everything else: ban check, daily limit (`say`), word rules on the board and on the AI answer. Event `say` in stats.
