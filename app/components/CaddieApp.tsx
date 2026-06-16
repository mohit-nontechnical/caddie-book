"use client";

import React, { useEffect, useRef, useState } from "react";
import { THEMES, Slot, Drill } from "@/lib/caddie-data";
import { DeviceFrame } from "./DeviceFrame";
import { Cover } from "./Cover";
import { BagView } from "./BagView";
import { SlotDetail } from "./SlotDetail";
import { DrillView } from "./DrillView";
import { InsightsView } from "./InsightsView";
import { UploadView } from "./UploadView";
import { CourseBook } from "./CourseBook";
import { ProfileView } from "./ProfileView";
import { TabBar } from "./TabBar";
import { GradesProvider } from "./GradesContext";

type StackEntry = { kind: "slot"; data: Slot } | { kind: "drill"; data: Drill };

function App() {
  const [theme] = useState<"dark" | "light">("dark");
  const [layout] = useState("grid");
  const [heatmap] = useState("subtle");
  const [tab, setTab] = useState("bag");
  const [stack, setStack] = useState<StackEntry[]>([]);
  const [doneDrills, setDoneDrills] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const GOLD = "#F0C040";

  const top = stack[stack.length - 1];
  const pushSlot = (slot: Slot) => setStack((s) => [...s, { kind: "slot", data: slot }]);
  const pushDrill = (drill: Drill) => setStack((s) => [...s, { kind: "drill", data: drill }]);
  const back = () => setStack((s) => s.slice(0, -1));
  const goTab = (tb: string) => { setStack([]); setTab(tb); };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab, stack.length]);

  const vars = {
    ...THEMES[theme],
    "--gold": GOLD,
    "--good": "#4CAF82",
    "--bad": "#C05C5C",
    "--font-display": "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    "--font-ui": "'Inter', system-ui, sans-serif",
    "--font-mono": "'IBM Plex Mono', ui-monospace, monospace",
  } as React.CSSProperties;

  let content: React.ReactNode;
  let overlayKey: string;
  if (top) {
    overlayKey = top.kind + (top.data.id || "");
    if (top.kind === "slot") {
      content = <SlotDetail slot={top.data} onBack={back} onOpenDrill={pushDrill} />;
    } else {
      content = <DrillView drill={top.data} onBack={back} onOpenSlot={pushSlot} done={!!doneDrills[top.data.id]} onToggleDone={() => setDoneDrills((d) => ({ ...d, [top.data.id]: !d[top.data.id] }))} />;
    }
  } else {
    overlayKey = "tab-" + tab;
    if (tab === "bag") content = <BagView layout={layout} heatmap={heatmap} onOpenSlot={pushSlot} onOpenDrill={pushDrill} onUpload={() => goTab("upload")} />;
    else if (tab === "feed") content = <InsightsView onOpenSlot={pushSlot} />;
    else if (tab === "upload") content = <UploadView onParsed={() => goTab("bag")} />;
    else if (tab === "courses") content = <CourseBook />;
    else content = <ProfileView />;
  }

  return (
    <GradesProvider>
      <DeviceFrame dark={theme === "dark"}>
        <div style={{ ...vars, position: "absolute", inset: 0, background: "var(--bg)", display: "flex", flexDirection: "column", color: "var(--cream)" }}>
          <div ref={scrollRef} className="sc-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0, paddingTop: 56 }}>
            <div key={overlayKey} className={top ? "sc-overlay" : "sc-view"}>
              {content}
            </div>
          </div>
          <TabBar tab={tab} onTab={goTab} gold={GOLD} />
        </div>
      </DeviceFrame>
    </GradesProvider>
  );
}

export default function CaddieApp() {
  const [entered, setEntered] = useState(false);
  return entered ? <App /> : <Cover onEnter={() => setEntered(true)} />;
}
