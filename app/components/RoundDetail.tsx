"use client";

import React from "react";
import { hexA } from "@/lib/caddie-data";
import { Back } from "./primitives";
import type { RoundSummary } from "./types";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function scoreTint(score: number): string {
  if (score <= 3) return hexA("#4CAF82", 0.35);
  if (score <= 4) return hexA("#4CAF82", 0.18);
  if (score >= 7) return hexA("#C05C5C", 0.35);
  if (score >= 6) return hexA("#C05C5C", 0.18);
  return "transparent";
}

const HoleCell = ({ holeNum, score }: { holeNum: number; score: number | undefined }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 34,
    flex: "0 0 34px",
  }}>
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 9.5,
      color: "var(--cream-3)",
      letterSpacing: "0.04em",
      marginBottom: 4,
    }}>
      {holeNum}
    </div>
    <div style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: score !== undefined ? scoreTint(score) : "transparent",
      border: "1px solid var(--line)",
      fontFamily: "var(--font-mono)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--cream)",
    }}>
      {score !== undefined ? score : "—"}
    </div>
  </div>
);

const TotalCell = ({ label, value }: { label: string; value: number }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 42,
    flex: "0 0 42px",
  }}>
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      color: "var(--gold)",
      letterSpacing: "0.06em",
      marginBottom: 4,
    }}>
      {label}
    </div>
    <div style={{
      width: 40,
      height: 32,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: hexA("#F0C040", 0.1),
      border: "1px solid " + hexA("#F0C040", 0.25),
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--gold)",
    }}>
      {value}
    </div>
  </div>
);

interface Props {
  round: RoundSummary;
  onBack: () => void;
}

export const RoundDetail = ({ round, onBack }: Props) => {
  const is18 = (round.holeCount ?? 0) >= 18;
  const holes = round.holes ?? [];

  return (
    <div style={{ paddingBottom: 28 }}>
      <Back onBack={onBack} label="Rounds" />

      {/* Header card */}
      <div style={{ padding: "0 16px", marginBottom: 16 }}>
        <div style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          padding: "18px 18px 16px",
        }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", color: "var(--cream-3)", marginBottom: 6 }}>
            SCORECARD
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--cream)", lineHeight: 1.1, marginBottom: 4 }}>
            {round.course || "Unknown Course"}
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--cream-3)", marginBottom: 14 }}>
            {fmtDate(round.date)}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 48, fontWeight: 600, color: "var(--cream)", lineHeight: 1 }}>
              {round.total}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cream-3)", letterSpacing: "0.1em" }}>TOTAL</div>
              {is18 && (
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--cream-2)", marginTop: 3 }}>
                  Front {round.front9} · Back {round.back9}
                </div>
              )}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.08em",
              color: "var(--cream-3)",
              background: hexA("#FFFFFF", 0.06),
              padding: "4px 10px",
              borderRadius: 8,
              alignSelf: "center",
            }}>
              {is18 ? "18 HOLES" : round.holeCount >= 9 ? "9 HOLES" : round.holeCount + " HOLES"}
            </div>
          </div>
        </div>
      </div>

      {/* Scorecard */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, padding: "14px 12px", overflowX: "auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", color: "var(--cream-3)", marginBottom: 12 }}>
            HOLE BY HOLE
          </div>

          {is18 ? (
            /* Two rows of 9 */
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Front 9 */}
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
                  {Array.from({ length: 9 }, (_, i) => (
                    <HoleCell key={i + 1} holeNum={i + 1} score={holes[i]} />
                  ))}
                  <TotalCell label="OUT" value={round.front9} />
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid var(--line)" }} />

              {/* Back 9 */}
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
                  {Array.from({ length: 9 }, (_, i) => (
                    <HoleCell key={i + 10} holeNum={i + 10} score={holes[i + 9]} />
                  ))}
                  <TotalCell label="IN" value={round.back9} />
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid var(--line)" }} />

              {/* Total row */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <TotalCell label="TOTAL" value={round.total} />
              </div>
            </div>
          ) : (
            /* Single row + total */
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
                {holes.map((score, i) => (
                  <HoleCell key={i + 1} holeNum={i + 1} score={score} />
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--line)" }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <TotalCell label="TOTAL" value={round.total} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
