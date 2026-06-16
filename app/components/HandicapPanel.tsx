import React, { useEffect, useState } from "react";
import { hexA } from "@/lib/caddie-data";
import { Sparkline, SLabel } from "./primitives";
import { IconChevron } from "./icons";
import { useHandicap, CourseRow } from "./useHandicap";

const INCLUDE9_KEY = "caddie:include9";

const CourseEditRow = ({ c, onSaved }: { c: CourseRow; onSaved: () => void }) => {
  const [rating, setRating] = useState(String(c.rating));
  const [slope, setSlope] = useState(String(c.slope));
  const [par, setPar] = useState(String(c.par));
  const [saving, setSaving] = useState(false);
  const dirty = rating !== String(c.rating) || slope !== String(c.slope) || par !== String(c.par);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: c.name, rating: Number(rating), slope: Number(slope), par: Number(par) }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)", borderRadius: 8,
    padding: "7px 8px", color: "var(--cream)", fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "center",
  };

  return (
    <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600, color: "var(--cream)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-3)" }}>{c.rounds18} rnd</span>
        {c.estimated && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold)", background: hexA("#F0C040", 0.14), padding: "2px 6px", borderRadius: 5 }}>EST</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 7, alignItems: "end" }}>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.1em", color: "var(--cream-3)", marginBottom: 3 }}>RATING</span>
          <input style={inputStyle} value={rating} inputMode="decimal" onChange={(e) => setRating(e.target.value)} />
        </label>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.1em", color: "var(--cream-3)", marginBottom: 3 }}>SLOPE</span>
          <input style={inputStyle} value={slope} inputMode="numeric" onChange={(e) => setSlope(e.target.value)} />
        </label>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.1em", color: "var(--cream-3)", marginBottom: 3 }}>PAR</span>
          <input style={inputStyle} value={par} inputMode="numeric" onChange={(e) => setPar(e.target.value)} />
        </label>
        <button onClick={save} disabled={!dirty || saving} className="sc-press" style={{ borderRadius: 8, padding: "8px 12px", cursor: dirty && !saving ? "pointer" : "default", border: "none", background: dirty ? "var(--gold)" : "rgba(255,255,255,0.07)", color: dirty ? "#0F2016" : "var(--cream-3)", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 700 }}>
          {saving ? "…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export const HandicapPanel = () => {
  const [include9, setInclude9] = useState(true);

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(INCLUDE9_KEY);
      if (stored !== null) setInclude9(stored !== "0");
    } catch { /* ignore */ }
  }, []);

  function toggleInclude9() {
    setInclude9((v) => {
      const next = !v;
      try { localStorage.setItem(INCLUDE9_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

  const { data, loading, reload } = useHandicap(include9);
  const [showEditor, setShowEditor] = useState(false);

  const index = data?.index;
  const trendData = (data?.trend ?? []).map((t) => 60 - t.index); // invert: lower index = higher line
  const estCount = data?.estimatedCourses?.length ?? 0;

  return (
    <>
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, padding: "16px", marginBottom: 11 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", color: "var(--cream-3)" }}>HANDICAP INDEX (WHS)</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 46, lineHeight: 1, fontWeight: 600, color: "var(--cream)", marginTop: 6 }}>
              {loading ? "…" : index != null ? index.toFixed(1) : "—"}
            </div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--cream-3)", marginTop: 5 }}>
              {loading
                ? "Calculating…"
                : index != null
                  ? `Best ${Math.min(8, data!.roundsUsed >= 20 ? 8 : data!.roundsUsed)} of last ${Math.min(20, data!.roundsUsed)} · ${data!.roundsUsed} eligible rounds (${data!.rounds18} × 18-hole${data!.rounds9 > 0 ? `, ${data!.rounds9} × 9-hole` : ""})`
                  : "Need at least 3 rounds"}
            </div>
          </div>
          {trendData.length > 1 && (
            <div style={{ width: 110, paddingTop: 8 }}>
              <Sparkline data={trendData} color="var(--good)" w={110} h={42} sw={2.2} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--cream-3)", textAlign: "right", marginTop: 4 }}>TREND</div>
            </div>
          )}
        </div>

        {estCount > 0 && (
          <div style={{ marginTop: 13, padding: "10px 12px", borderRadius: 11, background: hexA("#F0C040", 0.1), border: "1px solid " + hexA("#F0C040", 0.3), fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--cream-2)", lineHeight: 1.4 }}>
            {estCount} course{estCount === 1 ? "" : "s"} use estimated ratings. Refine them for an accurate index.
          </div>
        )}

        <button onClick={toggleInclude9} className="sc-press" style={{ marginTop: 13, width: "100%", display: "flex", alignItems: "center", gap: 11, background: "transparent", border: "1px solid var(--line)", borderRadius: 11, padding: "11px 13px", cursor: "pointer", textAlign: "left" }}>
          <span style={{ width: 38, height: 22, borderRadius: 999, background: include9 ? "var(--gold)" : "rgba(255,255,255,0.12)", position: "relative", flexShrink: 0, transition: "background 0.15s ease" }}>
            <span style={{ position: "absolute", top: 2, left: include9 ? 18 : 2, width: 18, height: 18, borderRadius: 999, background: "#fff", transition: "left 0.15s ease" }} />
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>Include 9-hole rounds</span>
            <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--cream-3)", marginTop: 1 }}>Uses the WHS doubling approximation for 9-hole differentials</span>
          </span>
        </button>

        <button onClick={() => setShowEditor((v) => !v)} className="sc-press" style={{ marginTop: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "1px solid var(--line)", borderRadius: 11, padding: "11px 13px", cursor: "pointer" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>Manage course ratings</span>
          <span style={{ transform: showEditor ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}><IconChevron size={16} stroke="var(--cream-3)" /></span>
        </button>
      </div>

      {showEditor && data && (
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", marginBottom: 11 }}>
          <div style={{ padding: "11px 14px", borderBottom: "1px solid var(--line)" }}>
            <SLabel>Course ratings · {data.courses.length}</SLabel>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "var(--cream-3)", lineHeight: 1.4 }}>Enter the Rating / Slope / Par from the tees you play. Saved values stop being &quot;estimated&quot;.</div>
          </div>
          {data.courses.map((c) => (
            <CourseEditRow key={c.norm} c={c} onSaved={reload} />
          ))}
        </div>
      )}
    </>
  );
};
