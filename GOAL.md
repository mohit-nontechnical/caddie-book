# 🎯 Goal: 18Birdies Premium feature parity (and beyond)

**North star:** Caddie Book should do everything a golfer pays 18Birdies Premium
($99/yr) for — *plus* the analysis features it already does better — so it can fully
replace 18Birdies for Mo.

Live: https://caddie-book.vercel.app · Stack: Next.js 16 + Turso + OpenRouter.

## Guiding principles (non-negotiable)
1. **Single source of truth.** Caddie Book replaces 18Birdies outright. Mo never runs
   both apps and never enters the same data twice. Capture happens *once*, here.
2. **Automatic over manual.** Match the *premium* experience: GPS auto-distances,
   one-tap/auto shot tracking, minimal score entry — not the manual double-entry grind.
   Every feature is judged by "how little does Mo have to tap?"
3. **Everything it captures feeds the analysis loop** (handicap, Coach, Strokes Gained,
   trends) with zero extra steps.

The existing 81 rounds are already imported; the 18Birdies JSON import stays only as a
one-time migration / backup path, not an ongoing workflow.

---

## Where we stand vs 18Birdies Premium

Legend: ✅ have · 🟡 partial · ❌ missing · ⭐ we already exceed 18Birdies

| Capability | 18Birdies | Caddie Book today | Status |
|---|---|---|---|
| Round history & basic stats (score, FIR, GIR, putts) | ✅ | imported 81 rounds + aggregates | ✅ |
| AI swing analysis (video/frames) | Premium | Gemini frame analysis | ⭐ |
| Scored drill library + improvement plan | ❌ (review calls this out) | drill library + Coach-assigned drills | ⭐ |
| Official WHS handicap (incl. 9-hole) | ❌ | full WHS engine, 31 rated courses | ⭐ |
| Bag/skill grading + plain-English insights | partial (advanced stats) | Coach grades 14 slots, live-updating | ⭐ |
| **Live GPS rangefinder** (front/middle/back of green) | ✅ signature | — | ❌ |
| **In-round live scoring** (enter as you play) | ✅ | import only (photo/JSON) | ❌ |
| **AI Caddie — club recommendation by distance/conditions** | ✅ signature | Coach is post-round only | ❌ |
| **Shot tracking + Strokes Gained** | ✅ (Smart Tracking) | aggregate stats only | 🟡→❌ |
| True club distances | ✅ | — | ❌ |
| Green reading / 3D green maps | ✅ | — | ❌ |
| Course database & discovery (40k courses) | ✅ | only courses played | ❌ |
| Apple Watch | ✅ | — (PWA limitation) | ❌ |
| Social / leaderboards / games & betting | ✅ | — | ❌ |

---

## ⚠️ Scope decision (2026-06-15): NO on-course tracking
Mo does not want to track anything *during* a round. Caddie Book is the **premium
post-round analytics brain**, not an on-course companion. Capture stays in whatever he
already uses (18Birdies free tier, paper scorecard photo) and flows in via import. The
win is getting 18Birdies-**Premium-grade analysis for free**, from data he already has —
with no double entry. On-course GPS / live scoring / shot tracking are **dropped**.

## Roadmap (premium analytics from existing data)

### Phase A — Insights engine ✅ SHIPPED (2026-06-15)
Live on the **Insights** tab (was "Patterns"): /api/insights + InsightsView render the
blow-up-hole map, gap-to-goal, scoring trend, front/back split, and consistency — all from
scoring data only (GIR/putts/fairways deliberately excluded as untrustworthy). Coach lives
below it. Original spec:
Mine the existing rounds for the premium-tier patterns 18Birdies/Arccos/DECADE charge
for, using only post-round data we already have (per-hole scores + per-round GIR, putts,
fairways, scoring distribution):
- **Strokes-lost by category** (off-the-tee / approach / short game / putting) vs a
  break-85 benchmark — the "where are my strokes going?" view (approx Strokes Gained).
- **Trends over time** for scoring, GIR%, fairway%, putts/round.
- **Front-9 vs back-9** split and fade/finish pattern.
- **Blow-up hole** frequency and impact.
- **Scoring distribution** (pars/bogeys/doubles rate) and gap-to-goal.
- **Course patterns** — where he scores best/worst relative to difficulty.
Deliver first as an analysis, then as an in-app **Insights** view.

### Phase B — Make the import effortless ✅ SHIPPED (2026-06-15)
Re-import now reports "what's new" — `added` vs `updated` counts, with an "all caught up"
message when nothing's new. (Import is idempotent by 18Birdies round id.)

### Phase C — Smarter Coach + tracked plan ✅ SHIPPED (2026-06-15)
Coach is grounded in the reliable scoring aggregates (avg, doubles/round, blow-up %) and
its plan centers on damage control / course management. A persistent `coach_plan` (Turso,
singleton) stores the plan + baseline (avg, doubles); each run shows progress vs baseline
with improving/steady/slipping status. "Set a new plan" resets the baseline.

### Dropped / out of scope
On-course GPS rangefinder, live in-round scoring, AI caddie club rec, live shot
tracking, 3D green maps, Apple Watch, social/betting. (Re-open only if Mo changes his mind.)

---

## Definition of done
Mo opens Caddie Book after importing his rounds and instantly sees: his Strokes-Gained-style
leak breakdown, his trends, his handicap, and a Coach plan for the #1 thing to fix — every
premium insight 18Birdies/Arccos charge for, from data he already has, entered once.

_Update this file as phases ship._
