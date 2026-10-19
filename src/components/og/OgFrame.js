// Shared layout for social preview images. Rendered by next/og, so inline styles only.
export const OG_SIZE = { width: 1200, height: 630 };

export function OgFrame({ eyebrow, title, subtitle, chips = [] }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "linear-gradient(135deg, #04142a 0%, #0b2545 58%, #07423c 100%)", color: "#ffffff", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="56" height="56" viewBox="0 0 34 34">
            <rect width="34" height="34" rx="10" fill="#0e8f82" />
            <path d="M7.5 15.5 L11 22.5 L14.5 12 L17 18 L19.5 12 L23 22.5 L26.5 15.5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            <span>Whole</span>
            <span style={{ color: "#5eead4" }}>Care</span>
          </div>
        </div>
        {eyebrow ? <div style={{ display: "flex", fontSize: 22, color: "#5eead4", textTransform: "uppercase", letterSpacing: 3 }}>{eyebrow}</div> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: title.length > 34 ? 62 : 76, fontWeight: 700, lineHeight: 1.06, letterSpacing: -1.5, maxWidth: 1040 }}>{title}</div>
        {subtitle ? <div style={{ display: "flex", marginTop: 22, fontSize: 30, lineHeight: 1.3, color: "#b6c3d3", maxWidth: 1000 }}>{subtitle}</div> : null}
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {chips.map((c) => (
          <div key={c} style={{ display: "flex", padding: "10px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", fontSize: 24, color: "#e9eef4" }}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
