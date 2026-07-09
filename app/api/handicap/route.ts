import { NextResponse } from "next/server";
import { getRounds, getCourseRatingOverrides, isCompleteRound } from "@/lib/caddie-store";
import { seedFor, normCourse } from "@/lib/course-ratings";
import { computeHandicap, type RatedRound } from "@/lib/handicap";

export const runtime = "nodejs";

// GET → { index, roundsUsed, rounds18, rounds9, recent20, trend, estimatedCourses, courses[] }
// Query param: include9=0|false to exclude 9-hole rounds (default: include them).
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw9 = searchParams.get("include9");
    const include9 = raw9 !== "0" && raw9 !== "false";

    const rounds = await getRounds(200);
    const overrides = await getCourseRatingOverrides();

    const resolve = (course: string) => {
      const norm = normCourse(course);
      const ov = overrides[norm];
      const seed = seedFor(course);
      return {
        rating: ov?.rating ?? seed.rating,
        slope: ov?.slope ?? seed.slope,
        par: ov?.par ?? seed.par,
        estimated: ov ? false : seed.estimated,
      };
    };

    // 18-hole rounds always drive the index.
    // Abandoned/invalid rounds are excluded — an implausible total would corrupt
    // the index since WHS averages your *lowest* differentials.
    const eighteen = rounds.filter(
      (r) => (r.stats?.holeCount ?? r.holes.length) >= 18 && r.total > 0 && isCompleteRound(r)
    );
    const rated: RatedRound[] = eighteen.map((r) => {
      const res = resolve(r.course);
      const holeCount = r.stats?.holeCount ?? r.holes.length;
      return { date: r.date, course: r.course, score: r.total, rating: res.rating, slope: res.slope, estimated: res.estimated, holeCount };
    });

    // Optionally include 9-hole rounds using the doubling approximation
    // (see lib/handicap.ts for the WHS math rationale).
    if (include9) {
      const nine = rounds.filter((r) => {
        const hc = r.stats?.holeCount ?? r.holes.length;
        return hc >= 9 && hc < 18 && r.total > 0 && isCompleteRound(r);
      });
      for (const r of nine) {
        const res = resolve(r.course);
        const holeCount = r.stats?.holeCount ?? r.holes.length;
        rated.push({ date: r.date, course: r.course, score: r.total, rating: res.rating, slope: res.slope, estimated: res.estimated, holeCount });
      }
    }

    const result = computeHandicap(rated);

    // Course summary for the ratings editor (all distinct courses played).
    const counts = new Map<string, { name: string; rounds18: number }>();
    for (const r of rounds) {
      const norm = normCourse(r.course);
      const cur = counts.get(norm) ?? { name: r.course, rounds18: 0 };
      if ((r.stats?.holeCount ?? r.holes.length) >= 18) cur.rounds18 += 1;
      counts.set(norm, cur);
    }
    const courses = Array.from(counts.entries())
      .map(([norm, v]) => {
        const res = resolve(v.name);
        return { name: v.name, norm, rounds18: v.rounds18, ...res };
      })
      .sort((a, b) => b.rounds18 - a.rounds18 || a.name.localeCompare(b.name));

    return NextResponse.json({
      index: result.index,
      roundsUsed: result.roundsUsed,
      rounds18: result.rounds18,
      rounds9: result.rounds9,
      recent20: result.recent20,
      trend: result.trend,
      estimatedCourses: result.estimatedCourses,
      courses,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
