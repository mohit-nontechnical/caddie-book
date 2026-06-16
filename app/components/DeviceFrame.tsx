import React from "react";
import { useIsMobile } from "./useIsMobile";

function IOSStatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? "#fff" : "#000";
  return (
    <div style={{ display: "flex", gap: 154, alignItems: "center", justifyContent: "center", padding: "21px 24px 19px", boxSizing: "border-box", position: "relative", zIndex: 20, width: "100%" }}>
      <div style={{ flex: 1, height: 22, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 1.5 }}>
        <span style={{ fontFamily: '-apple-system,"SF Pro",system-ui', fontWeight: 590, fontSize: 17, lineHeight: "22px", color: c }}>9:41</span>
      </div>
      <div style={{ flex: 1, height: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, paddingTop: 1, paddingRight: 1 }}>
        <svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c} /><rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c} /><rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c} /><rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c} /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none" /><rect x="2" y="2" width="20" height="9" rx="2" fill={c} /><path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4" /></svg>
      </div>
    </div>
  );
}

// Renders children inside an iOS device bezel on desktop, or full-bleed
// (with a faux status bar) on phone-sized viewports.
export function DeviceFrame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{ width: "100vw", height: "100dvh", position: "relative", overflow: "hidden", background: dark ? "#000" : "#F2F2F7" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
          <IOSStatusBar dark={dark} />
        </div>
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={{ width: 393, height: 852, borderRadius: 48, overflow: "hidden", position: "relative", background: dark ? "#000" : "#F2F2F7", boxShadow: "0 50px 100px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
      <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 126, height: 37, borderRadius: 24, background: "#000", zIndex: 50 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <IOSStatusBar dark={dark} />
      </div>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 60, height: 34, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 8, pointerEvents: "none" }}>
        <div style={{ width: 139, height: 5, borderRadius: 100, background: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.25)" }} />
      </div>
    </div>
  );
}
