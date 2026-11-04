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
| `PEXELS_API_KEY` | optional | Real photos on the board |
| `GEMINI_MODEL` | optional | Default `gemini-flash-latest` |
| `GROQ_MODEL` | optional | Default `llama-3.3-70b-versatile` |
| `GROQ_WHISPER_MODEL` | optional | Default `whisper-large-v3-turbo` |
| `TANGENT_DAILY_LIMIT` | optional | Ideas per device/IP per day, default 20 |

4. Deploy. Netlify Blobs (bans, limits, counters) works automatically.

## How it works

- `public/` static site: `index.html`, `assets/app.js` (mic, WAV conversion, board, garden, postcard, shake), `assets/scenes.js` (built-in drawings), `assets/sounds.js` (ambient sounds).
- `netlify/functions/analyze.mjs` → `/api/analyze`: rules, AI interpretation, safety checks, photos.
- `netlify/functions/draw.mjs` → `/api/draw`: AI drawings for each tile.
- `netlify/functions/stats.mjs` → `/api/stats?token=STATS_TOKEN`: usage counter for the last 14 days.
- `netlify/functions/_lib/guard.mjs`: the rules (prohibited topics, swear words, strikes and bans, daily limits).

## Rules

First prohibited message: session closed with a warning. Second: device and IP blocked. Self-harm talk is never punished; it shows helplines instead.

## Sounds

Recorded sounds can replace the synthesised ones, see `public/assets/sounds/README.md`.
