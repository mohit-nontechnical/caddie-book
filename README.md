# Caddie Book by Mo

Your AI caddie — learns your game from scorecards and swing clips, grades every "slot"
in your bag, and assigns the one drill that fixes the most strokes.

Built with Next.js 16 (App Router) + React 19 + Tailwind 4, with AI via OpenRouter.

## Run it

```bash
npm install
echo "OPENROUTER_API_KEY=sk-or-..." > .env.local   # get a key at https://openrouter.ai/keys
npm run dev
```

Open http://localhost:3000 (or the port printed in the terminal).

> Without a key the UI works fully — use the **"Try a demo parse"** button on the Upload
> tab to see the flow. Real scorecard parsing needs the key.

## Responsive

- **Phone (<600px):** full-bleed native-style app.
- **Desktop (≥600px):** the app centered inside an iOS device frame.

## Structure

```
app/
  page.tsx                 # mounts the app
  layout.tsx               # fonts + metadata
  components/              # all UI (ported from the HTML prototype)
  api/
    parse-round/           # scorecard image → structured hole JSON (Haiku vision)
    analyze-swing/         # swing frames → coaching note (Sonnet vision)
    coach/                 # round history → patterns + grades (Sonnet)
lib/
  openrouter.ts            # OpenRouter chat client + JSON/vision helpers
  caddie-data.ts           # domain data, themes, grade colors
  caddie-store.ts          # round persistence via libSQL (local file or Turso cloud)
```

## Storage (libSQL / Turso)

Rounds are stored in a SQLite-compatible libSQL database. The same code runs two ways:

| Mode | Setup | Notes |
|------|-------|-------|
| **Local dev** | nothing — defaults to a `caddie.db` file | Created automatically, gitignored |
| **Free cloud** | set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` | Create a free DB at https://turso.tech |

Parsing a scorecard (`/api/parse-round`) persists the round; `/api/coach` reads round
history back out. Switching from local to cloud is purely an env-var change — no code edits.

## Importing 18Birdies history

18Birdies has no CSV/API export, but its **Download Your Account Data** feature
(https://18birdies.com/download-account-data/) emails you a JSON archive. Drop that file on
the Upload tab via the **"18Birdies"** tile and it bulk-imports every round (idempotent —
re-importing won't duplicate). It maps per-hole scores + per-round aggregate stats (GIR,
putts, fairways) into the `rounds` table; Coach then analyzes your real history.

## Models (via OpenRouter)

| Task | Model | Why |
|------|-------|-----|
| Parse scorecard | `google/gemini-2.5-flash` | robust, cheap vision OCR |
| Analyze swing | `google/gemini-2.5-flash` | forgiving image handling |
| Patterns / grades | `anthropic/claude-sonnet-4.5` | multi-round synthesis (text) |

> `anthropic/claude-3.5-haiku` is **not** usable for vision on OpenRouter — it only routes
> to Amazon Bedrock, which rejects image input despite metadata claiming support.

## Deploy

`vercel deploy`, then set `OPENROUTER_API_KEY`, `TURSO_DATABASE_URL`, and
`TURSO_AUTH_TOKEN` in the project's env vars. With Turso configured, persistence works
on Vercel's read-only filesystem (the local-file fallback would not).
