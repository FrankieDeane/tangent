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

- `public/` static site: `index.html`, `assets/burbujas.js` and `assets/burbujas.css` (bubbles app), `assets/scenes/` (Día, Noche, Nord art).
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

## Sharper reading (v5)

- **Mixed ideas**: the AI lists 1 to 3 separate `ideas`; every tile and step carries its idea number, and the board shows "You talked about N ideas" so unrelated topics never blend.
- **Board language**: the board is written in the language picked in the header (people can mix Spanish and English while talking). Switching language translates the open board with `POST /api/translate` (cached per board, daily limit `tr`, word rules on both sides).
- **Fix + learn**: voting "Sort of" or "No" opens "What did I get wrong?". The correction rebuilds the board from the transcript, and is kept on the device (`tangent.learn`, last 12) and sent as short `notes` with every new recording, so the AI reads that person better each time. Events `correct` and `translate`.
- **The Spark**: an ADHD mind jumps between topics; Tangent treats those jumps as divergent thinking, not noise.
  - Every board can carry `spark` (`jumps`, `link`, `idea`): the topics the person jumped between, the hidden thread that joins them, and an original idea born from joining them. Shown as a constellation tile.
  - `POST /api/spark` with `mode: "garden"` links 2 to 4 ideas recorded on different days (only the cores and side ideas from the device are sent).
  - `POST /api/spark` with `mode: "images"` reads 1 to 4 photos, screenshots or charts (resized to 768 px JPEG in the browser), finds the pattern that joins them and links it to recent ideas. Gemini only (vision). Images are not stored. Unsafe images count as a violation, like words.
  - Daily limit `spark`, word rules on input and output. Events `spark_garden`, `spark_images` in stats.

## Burbujas: accounts and payments (v6)
Netlify environment variables (scopes: Functions + Deploy Previews + Production):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (public), `SUPABASE_SERVICE_ROLE_KEY` (secret key: `sb_secret_...` or legacy `service_role`).
- `MP_ACCESS_TOKEN` (Mercado Pago production access token), `MP_PRICE_ARS` (monthly amount in pesos, about 1 USD), `MP_WEBHOOK_SECRET` (from Mercado Pago → Your integrations → Webhooks).
- Check what is in place (yes/no only): `/api/supabase-check`.

Supabase:
- Run `supabase_schema.sql` once in SQL Editor.
- Authentication → URL Configuration: Site URL `https://tangent-adhd.netlify.app`; Redirect URLs `https://tangent-adhd.netlify.app/**` and `https://*--tangent-adhd.netlify.app/**`.
- Authentication → Emails → templates "Confirm signup" and "Reset password": include `{{ .Token }}` so the email carries the 6-digit code the site asks for.

Mercado Pago:
- Webhooks: URL `https://tangent-adhd.netlify.app/api/pay/webhook`, events "Planes y suscripciones" (subscription_preapproval, subscription_authorized_payment).
- The plan is read back from Mercado Pago on each notification and written to `subscriptions` with the service key.

Owner: suggestions and right-to-withdraw requests at `/api/suggest?token=STATS_TOKEN`.
