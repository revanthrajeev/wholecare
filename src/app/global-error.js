"use client"; // Error boundaries must be Client Components

// Replaces the root layout when it fails, so it carries its own document and inline styles.
export default function GlobalError({ error, retry }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#04142a", color: "#ffffff", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <title>Something went wrong · Whole Care</title>
          <p style={{ color: "#5eead4", letterSpacing: 2, textTransform: "uppercase", fontSize: 13, fontWeight: 700 }}>Whole Care</p>
          <h1 style={{ fontSize: 32, margin: "12px 0" }}>We hit an unexpected problem</h1>
          <p style={{ color: "#b6c3d3", maxWidth: 440, margin: "0 auto 24px" }}>Please try again in a moment.{error?.digest ? ` Reference: ${error.digest}` : ""}</p>
          <button onClick={() => retry()} style={{ background: "#5eead4", color: "#04142a", border: 0, borderRadius: 999, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
