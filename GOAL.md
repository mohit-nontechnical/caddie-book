# 🎯 Goal: the after-game brain that sits on top of 18Birdies

**North star:** Mo keeps scoring his rounds in **18Birdies** (free tier). Caddie Book is
the **after-the-round analysis layer** on top of that data — it imports what 18Birdies
already collected and answers one question: *what's costing me strokes, and what do I do
about it?*

We are **not** reinventing the wheel. Capture (live scoring, GPS, shot tracking) stays in
18Birdies. Caddie Book is the post-round coach 18Birdies/Arccos charge premium for —
running on data Mo already has, entered once, in 18Birdies.

Live: https://caddie-book.vercel.app · Stack: Next.js 16 + Turso + OpenRouter.

## Guiding principles (non-negotiable)
1. **Downstream of 18Birdies, never a replacement.** 18Birdies is the system of record for
   *capturing* rounds. Caddie Book never asks Mo to score on-course or re-enter data. The
   import is the front door, not a one-time migration.
2. **After-game only.** Every feature answers a question Mo has *after* he walks off the
   18th: where did I bleed strokes, is it getting better, what's the one thing to fix?
   Nothing happens during a round.
3. **Scoring data only — no fabricated precision.** 18Birdies' per-round GIR/fairway/putt
   fields are unreliable (proven 2026-06-15). Analysis is built on trustworthy signals only:
   per-hole scores, totals, scoring distribution, handicap. Never quote stats we can't trust.
4. **Effortless re-sync.** Mo plays, exports from 18Birdies, drops the file in. Import is
   idempotent (by 18Birdies round id) and reports exactly what's new.

---

## The core loop (this is the whole product)
```
18Birdies (capture)  →  export JSON  →  Caddie Book import  →  Insights + Coach
   play rounds            Download           idempotent          "what's wrong +
                          Your Data          re-sync             what to do"
```

## ✅ What works today
- **Import** (`/api/import-18birdies`, Upload tab) — primary path, idempotent, reports
  added/updated/courses. 81 rounds / 31 courses already in. Re-import = just new rounds.
- **Insights** (`/api/insights`, Insights tab) — blow-up-hole map, gap-to-goal, scoring
  trend, front/back split, consistency. Scoring-only (GIR/putts/fairways excluded).
- **Coach** (`/api/coach`) — sonnet-4.5 grounded in reliable aggregates (avg, doubles/round,
  blow-up %); damage-control plan + persistent baseline with improving/steady/slipping
  progress. (Backend verified live 2026-06-22.)
- **WHS handicap** (`/api/handicap`) — full engine, 31 rated courses, filters invalid rounds.
- **Rounds & Courses** — per-hole scorecards, best-courses ranking, OSM course map.
- **Bag grading** — Coach grades 14 bag slots from scoring patterns.
- **Bonus capture** (not the focus): scorecard-photo OCR + AI swing analysis, for when Mo
  *doesn't* have an 18Birdies round to import.

## ⛔ Explicitly out of scope (do NOT build — this is the "don't reinvent" line)
On-course GPS rangefinder · live in-round scoring · AI caddie club rec · live shot tracking ·
Strokes-Gained-by-category from shot data · 3D green maps · Apple Watch · social/betting/leaderboards.
18Birdies already does capture. Re-open only if Mo explicitly changes his mind.

---

## Roadmap — deepen the after-game analysis

### Done
- ✅ Insights engine (scoring-only patterns) — 2026-06-15
- ✅ Idempotent import with "what's new" report — 2026-06-15
- ✅ Coach + tracked plan with baseline progress — 2026-06-15
- ✅ Rounds / Courses / Map browse UX — 2026-06-15
- ✅ Ripped out fake iOS device-frame; real responsive mobile website — 2026-06-22
- ✅ Upload reframed around 18Birdies import as the hero path; real recent rounds — 2026-06-22
- ✅ **Per-round debrief on import** (`/api/debrief` + RoundDebrief card) — auto-shows after an
   import: vs-your-avg, blow-up holes + "bogey those = score N", scoring chips, AI coach note,
   and a per-round bounce-back/tilt read. Scoring-data-only. — 2026-06-22
- ✅ **Season-wide tilt / bounce-back score** (insights `mental` block + Mental game card) —
   across all rounds: after a blow-up hole, how often the next hole stays clean (≤5). Shows
   recovered %, doubled-up %, and an early→recent trend. — 2026-06-22

- ✅ **Pre-round mental card** (`/api/preround` + PreRoundCard, top of Bag tab) — collapsible
   "before you tee off" routine grounded in real leaks (play-to-bogey target, slow-start warning
   only if data supports it, take-your-medicine on the blow-up rate, stop-the-bleeding tilt reset)
   + AI mantra. Mental game is Mo's stated weak spot. — 2026-06-22

- ✅ **Conversational Coach** (`/api/coach-chat` + CoachChat overlay, "Ask Coach anything" on
   Insights tab) — chat grounded in a per-player context blob (avg, blow-up %, tilt, front/back,
   per-course aggregates, recent rounds). Scoring-data only. Correctly answers "which course is
   hardest" (Baylands 105.5) and "why I blow up" (tilt). — 2026-06-22

- ✅ **Strokes Gained: Total** (`/api/strokes-gained` + StrokesGained card on Insights) — honest,
   course-difficulty-adjusted SG = index − differential (no shot data needed). Shows potential vs
   typical gap, per-round SG trend, best/worst rounds, and per-course over/under-performance
   diverging bars (reframes "hardest course" as "where you leak strokes vs difficulty"). — 2026-06-22

- ✅ **Victory interactive charts** (Charts.tsx + ChartsLazy.tsx, lazy `ssr:false`) — SG trend
   (StrokesGained), score trend + scoring distribution (Insights) are now interactive Victory charts
   with tap/hover tooltips. Kept out of first paint + prerender-safe. — 2026-06-22

### Next (after-game depth, in priority order)
1. **Goal tracker to break 85** — gap-to-goal exists; make it a live "X strokes away, here's the
   path" card with trend, on the home screen.
2. **Export reminder nudge** — gentle "you've got N rounds in 18Birdies not yet synced" hint.
3. **Executive-course rating cleanup** — par-3/exec courses (Deep Cliff) skew SG; floor their ratings.

---

## Definition of done
Mo finishes a round in 18Birdies, exports, drops the file into Caddie Book, and immediately
sees: what that round (and the trend) says about his game, his handicap, and the #1 thing to
fix next — premium-grade post-round coaching from data he captured once, in the app he already
uses. No on-course tracking, no double entry.

_Update this file as phases ship._
