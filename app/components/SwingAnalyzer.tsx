import React, { useRef, useState } from "react";
import { slots, gradeColor, hexA } from "@/lib/caddie-data";
import { Back } from "./primitives";
import { IconScan, IconSpark, IconTarget } from "./icons";

interface SwingResult {
  observation: string;
  drillRecommendation: string;
  bagSlotAffected: string;
  confidence: "low" | "medium" | "high";
}

type Stage = "idle" | "analyzing" | "done" | "error";

export const SwingAnalyzer = ({ onBack }: { onBack: () => void }) => {
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<SwingResult | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const [count, setCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function filesToDataUrls(files: FileList): Promise<string[]> {
    return Promise.all(
      Array.from(files)
        .slice(0, 3)
        .map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.onerror = reject;
              r.readAsDataURL(file);
            })
        )
    );
  }

  async function handleFiles(files: FileList) {
    setCount(Math.min(3, files.length));
    setStage("analyzing");
    try {
      const frames = await filesToDataUrls(files);
      const res = await fetch("/api/analyze-swing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analysis failed");
      setResult(data);
      setStage("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Something went wrong");
      setStage("error");
    }
  }

  function runDemo() {
    setStage("analyzing");
    setCount(3);
    setTimeout(() => {
      setResult({
        observation:
          "Lead wrist cups at the top and the clubface opens through impact — that's the source of the push-slice with the driver.",
        drillRecommendation: "Tempo Count — 3-to-1 backswing-to-downswing count at 80% effort.",
        bagSlotAffected: "driver",
        confidence: "high",
      });
      setStage("done");
    }, 1700);
  }

  const slot = result ? slots.find((s) => s.id === result.bagSlotAffected) : undefined;
  const c = slot ? gradeColor(slot.grade) : "var(--gold)";
  const confColor = result?.confidence === "high" ? "var(--good)" : result?.confidence === "low" ? "var(--bad)" : "var(--gold)";

  return (
    <div style={{ paddingBottom: 28 }}>
      <Back onBack={onBack} label="Upload" />
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }} />

      <div style={{ padding: "0 16px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.2em", color: "var(--cream-3)" }}>SWING ANALYSIS</div>
        <h1 style={{ margin: "3px 0 0", fontFamily: "var(--font-display)", fontSize: 29, fontWeight: 600, color: "var(--cream)", letterSpacing: "-0.015em" }}>Read my swing</h1>
        <p style={{ margin: "7px 0 0", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--cream-3)", lineHeight: 1.4 }}>Drop 2–3 frames from one swing (address, top, impact). Coach spots the fault and assigns a drill.</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {stage === "idle" && (
          <>
            <button onClick={() => fileRef.current?.click()} className="sc-press" style={{ width: "100%", cursor: "pointer", borderRadius: 20, padding: "34px 20px", border: "1.5px dashed " + hexA("#F0C040", 0.5), background: "linear-gradient(160deg, " + hexA("#F0C040", 0.07) + ", transparent), var(--panel)", display: "flex", flexDirection: "column", alignItems: "center", gap: 13 }}>
              <span style={{ width: 56, height: 56, borderRadius: 18, background: hexA("#F0C040", 0.14), display: "grid", placeItems: "center" }}>
                <IconScan size={26} stroke="var(--gold)" />
              </span>
              <span style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 600, color: "var(--cream)" }}>Pick up to 3 swing frames</span>
                <span style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--cream-3)", marginTop: 4 }}>JPG / PNG · one swing</span>
              </span>
            </button>
            <button onClick={runDemo} className="sc-press" style={{ marginTop: 12, width: "100%", borderRadius: 12, padding: "11px", cursor: "pointer", border: "1px solid var(--line)", background: "transparent", color: "var(--cream-3)", fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 500 }}>Try a demo analysis (no upload)</button>
          </>
        )}

        {stage === "analyzing" && (
          <div style={{ borderRadius: 18, border: "1px solid var(--line)", background: "var(--panel)", padding: "30px 22px", textAlign: "center" }}>
            <span style={{ width: 50, height: 50, borderRadius: 999, background: hexA("#F0C040", 0.14), display: "grid", placeItems: "center", margin: "0 auto" }}>
              <IconScan size={24} stroke="var(--gold)" />
            </span>
            <div style={{ marginTop: 14, fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: "var(--cream)" }}>Analyzing {count} frame{count === 1 ? "" : "s"}…</div>
            <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cream-3)", letterSpacing: "0.1em" }}>READING SWING PATH</div>
          </div>
        )}

        {stage === "done" && result && (
          <div>
            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: "1px solid " + hexA(String(c), 0.4), background: "linear-gradient(160deg, " + hexA(String(c), 0.14) + ", transparent 65%), var(--panel)", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <IconSpark size={15} stroke="var(--gold)" />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em", color: "var(--gold)" }}>COACH READ</span>
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", color: confColor, background: hexA(confColor === "var(--good)" ? "#4CAF82" : confColor === "var(--bad)" ? "#C05C5C" : "#F0C040", 0.14), padding: "3px 9px", borderRadius: 999 }}>{result.confidence.toUpperCase()} CONFIDENCE</span>
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-ui)", fontSize: 14.5, color: "var(--cream)", lineHeight: 1.5 }}>{result.observation}</p>
              {slot && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, display: "grid", placeItems: "center", background: hexA(String(c), 0.18), fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: String(c) }}>{slot.grade}</span>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--cream-2)" }}>Affects {slot.name}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 12, borderRadius: 16, border: "1px solid var(--line)", background: "var(--panel)", padding: "15px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", background: hexA("#F0C040", 0.14) }}>
                <IconTarget size={20} stroke="var(--gold)" />
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em", color: "var(--cream-3)" }}>RECOMMENDED DRILL</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--cream)", marginTop: 3, lineHeight: 1.4 }}>{result.drillRecommendation}</div>
              </div>
            </div>

            <button onClick={() => { setStage("idle"); setResult(null); }} className="sc-press" style={{ marginTop: 14, width: "100%", borderRadius: 14, padding: "14px", cursor: "pointer", border: "none", background: "var(--gold)", color: "#0F2016", fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 700 }}>Analyze another swing</button>
          </div>
        )}

        {stage === "error" && (
          <div>
            <div style={{ borderRadius: 18, border: "1px solid " + hexA("#C05C5C", 0.45), background: "linear-gradient(160deg, " + hexA("#C05C5C", 0.12) + ", transparent), var(--panel)", padding: "22px 20px", textAlign: "center" }}>
              <span style={{ width: 50, height: 50, borderRadius: 999, background: hexA("#C05C5C", 0.18), display: "grid", placeItems: "center", margin: "0 auto", color: "var(--bad)", fontSize: 24 }}>!</span>
              <h2 style={{ margin: "12px 0 0", fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: "var(--cream)" }}>Couldn&apos;t analyze that</h2>
              <p style={{ margin: "7px 0 0", fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--cream-2)", lineHeight: 1.45 }}>{errMsg}</p>
            </div>
            <button onClick={() => setStage("idle")} className="sc-press" style={{ marginTop: 14, width: "100%", borderRadius: 14, padding: "14px", cursor: "pointer", border: "none", background: "var(--gold)", color: "#0F2016", fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 700 }}>Try again</button>
          </div>
        )}
      </div>
    </div>
  );
};
