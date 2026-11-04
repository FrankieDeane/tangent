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
