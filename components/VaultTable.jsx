"use client";
import { useState, useMemo } from "react";
import { C, TYPE_PILL } from "@/lib/constants";
import { fmt, aprColor, stakeUrl } from "@/lib/utils";

export default function VaultTable({ initialVaults, beraPrice, source }) {
  const [sk, setSk]       = useState("apr");
  const [sd, setSd]       = useState("desc");
  const [ft, setFt]       = useState("All");
  const [search, setSrch] = useState("");
  const [ao, setAo]       = useState(true);

  const types = useMemo(
    () => ["All", ...new Set(initialVaults.map((v) => v.type).filter(Boolean))],
    [initialVaults]
  );

  const sorted = useMemo(() => {
    let v = [...initialVaults];
    if (ao) v = v.filter((x) => x.active !== false);
    if (ft !== "All") v = v.filter((x) => x.type === ft);
    if (search) {
      const q = search.toLowerCase();
      v = v.filter((x) => (x.name + x.symbol + x.protocol).toLowerCase().includes(q));
    }
    v.sort((a, b) => {
      const av = a[sk] ?? -Infinity, bv = b[sk] ?? -Infinity;
      return sd === "desc" ? bv - av : av - bv;
    });
    return v;
  }, [initialVaults, sk, sd, ft, search, ao]);

  function toggleSort(k) {
    if (sk === k) setSd((d) => (d === "desc" ? "asc" : "desc"));
    else { setSk(k); setSd("desc"); }
  }

  const Arr = ({ k }) => (
    <span style={{ fontSize: 10, marginLeft: 3, opacity: sk === k ? 0.9 : 0.2 }}>
      {sk === k ? (sd === "desc" ? "▼" : "▲") : "⇅"}
    </span>
  );

  const TH = ({ l, k }) => (
    <th
      className={k ? "sort-th" : ""}
      onClick={k ? () => toggleSort(k) : undefined}
      style={{
        padding: "10px 14px", fontSize: 11, textAlign: "left",
        borderBottom: `1px solid ${C.border}`, letterSpacing: "0.05em",
        textTransform: "uppercase", fontWeight: 500,
        color: k === sk ? C.text1 : C.text2,
      }}
    >
      {l}{k && <Arr k={k} />}
    </th>
  );

  const tdS = {
    padding: "11px 14px", fontSize: 13,
    borderBottom: `1px solid ${C.border}`,
    verticalAlign: "middle",
    background: C.bg1,
  };

  return (
    <div style={{ marginBottom: "1.75rem" }}>
      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search vault, protocol…"
          value={search}
          onChange={(e) => setSrch(e.target.value)}
          style={{ flex: 1, minWidth: 180, maxWidth: 280 }}
        />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {types.map((t) => (
            <button key={t} className={`pill-btn${ft === t ? " on" : ""}`} onClick={() => setFt(t)}>{t}</button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.text1, cursor: "pointer" }}>
          <input type="checkbox" checked={ao} onChange={(e) => setAo(e.target.checked)} />
          Active only
        </label>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "13%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "17%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: C.bg2 }}>
              <TH l="Protocol"  k="protocol" />
              <TH l="Vault"     k="name"     />
              <TH l="Type"      k="type"     />
              <TH l="APR"       k="apr"      />
              <TH l="TVL"       k="tvl"      />
              <TH l="BGT / day" k="bgtPerDay"/>
              <TH l="Action"    k={null}     />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: C.text2, fontSize: 13 }}>
                  No vaults match filters
                </td>
              </tr>
            )}
            {sorted.map((v) => {
              const tp = TYPE_PILL[v.type] ?? { bg: C.bg3, c: C.text1 };
              return (
                <tr key={v.id} className="br-row" style={{ opacity: v.active === false ? 0.35 : 1 }}>
                  <td style={tdS}><span style={{ fontWeight: 500, color: C.text0 }}>{v.protocol}</span></td>
                  <td style={{ ...tdS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span title={v.name}>{v.name}</span>
                    {v.symbol && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: C.text2, fontFamily: C.mono }}>{v.symbol}</span>
                    )}
                  </td>
                  <td style={tdS}>
                    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: tp.bg, color: tp.c, fontWeight: 500 }}>{v.type}</span>
                  </td>
                  <td style={tdS}>
                    {v.apr != null
                      ? <span style={{ fontFamily: C.mono, fontSize: 15, fontWeight: 500, color: aprColor(v.apr) }}>{fmt(v.apr, 0)}%</span>
                      : <span style={{ color: C.text2 }}>—</span>}
                  </td>
                  <td style={{ ...tdS, fontFamily: C.mono, color: C.text1 }}>
                    {v.tvl != null ? "$" + fmt(v.tvl) : <span style={{ color: C.text2 }}>—</span>}
                  </td>
                  <td style={{ ...tdS, fontFamily: C.mono, color: C.text1 }}>
                    {v.bgtPerDay > 0 ? fmt(v.bgtPerDay, 3) : "—"}
                  </td>
                  <td style={tdS}>
                    <a href={stakeUrl(v)} target="_blank" rel="noopener noreferrer" className="lnk">
                      Stake on {v.protocol === "Kodiak" ? "Kodiak" : v.protocol} →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
