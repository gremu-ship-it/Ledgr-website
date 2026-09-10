import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ledgr — Smart accounting for Malawian businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0c1f1a 0%, #0e4435 60%, #1d9e75 100%)",
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "22px",
              background: "#1d9e75",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "52px",
              fontWeight: 800,
            }}
          >
            L
          </div>
          <div style={{ fontSize: "52px", fontWeight: 800 }}>Ledgr</div>
        </div>
        <div style={{ marginTop: "36px", fontSize: "68px", fontWeight: 800, lineHeight: 1.1 }}>
          Smart accounting for Malawian businesses
        </div>
        <div style={{ marginTop: "24px", fontSize: "30px", color: "#a7f3d0" }}>
          MWK-first · MRA-compliant · Works offline
        </div>
      </div>
    ),
    { ...size },
  );
}
