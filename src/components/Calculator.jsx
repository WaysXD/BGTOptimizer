import { useState, useMemo } from "react";
import { C } from "../lib/constants";
import { fmt, aprPill } from "../lib/utils";

export default function Calculator({ vaults, beraPrice }) {
  const [amt, setAmt] = useState(1000);

  const top5 = useMemo(
    () =>
      [...vaults]
        .filter((v) => v.active !== false && v.apr != null && v.apr > 0)
        .sort((a, b) => b.apr - a.apr)
        .slice(0, 5),
    [vaults]
  );

  return (
    <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.25rem 1.4rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>BGT earnings calculator</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, color: C.text2 }}>Deposit</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 10, color: C.text2, fontSize: 13, pointerEvents: "none" }}>$</span>
            <input
              type="number"
              value={amt}
              onChange={(e) => setAmt(Number(e.target.value))}
              style={{ paddingLeft: 22, width: 130 }}
              min={0}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 10 }}>
        {top5.map((v) => {
          const yUsd = amt * (v.apr / 100);
          const yBgt = beraPrice ? yUsd / beraPrice : null;
          const dBgt = yBgt ? yBgt / 365 : null;
          const p    = aprPill(v.apr ?? 0);
          return (
            <div key={v.id} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{v.protocol}</div>
              <div style={{ fontSize: 11, color: C.text2, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                <span style={{ fontFamily: C.mono, fontSize: 18, fontWeight: 500, color: p.c }}>{fmt(v.apr, 0)}%</span>
                <span style={{ fontSize: 11, color: C.text2 }}>APR</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div style={{ background: C.bg3, borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: C.text2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Daily BGT</div>
                  <div style={{ fontFamily: C.mono, fontSize: 15, fontWeight: 500 }}>{dBgt ? dBgt.toFixed(3) : "—"}</div>
                </div>
                <div style={{ background: C.bg3, borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: C.text2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Yearly</div>
                  <div style={{ fontFamily: C.mono, fontSize: 15, fontWeight: 500, color: C.honey }}>${fmt(yUsd, 0)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
