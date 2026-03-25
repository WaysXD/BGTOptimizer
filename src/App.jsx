import { useState, useEffect } from "react";
import { C, MOCK } from "./lib/constants";
import { fmt, aprPill, stakeUrl } from "./lib/utils";
import { loadVaults } from "./lib/vaults";
import VaultTable from "./components/VaultTable";
import WalletPanel from "./components/WalletPanel";
import Calculator from "./components/Calculator";
import "./App.css";

export default function App() {
  const [vaults, setVaults]       = useState(MOCK);
  const [beraPrice, setBeraPrice] = useState(null);
  const [source, setSource]       = useState("loading");

  useEffect(() => {
    loadVaults()
      .then(({ vaults, beraPrice }) => {
        setVaults(vaults);
        setBeraPrice(beraPrice);
        setSource("live");
      })
      .catch(() => setSource("mock"));
  }, []);

  // Stats (active vaults only)
  const active      = vaults.filter((v) => v.active !== false);
  const aprs        = active.map((v) => v.apr).filter((n) => n != null && n > 0);
  const tvls        = active.map((v) => v.tvl).filter((n) => n != null && n > 0);
  const topApr      = aprs.length ? Math.max(...aprs) : null;
  const avgApr      = aprs.length ? aprs.reduce((a, b) => a + b, 0) / aprs.length : null;
  const totalTvl    = tvls.length ? tvls.reduce((a, b) => a + b, 0) : null;
  const pricedCount = active.filter((v) => v.tvl != null).length;

  const top3 = [...vaults]
    .filter((v) => v.active !== false && v.apr != null && v.apr > 0)
    .sort((a, b) => b.apr - a.apr)
    .slice(0, 3);

  const statsCards = [
    { label: "Active vaults", value: source === "loading" ? "…" : active.length, sub: "accepting deposits" },
    { label: "Top APR",       value: topApr != null ? fmt(topApr, 0) + "%" : "…",  sub: "highest single vault", hi: true },
    { label: "Average APR",   value: avgApr != null ? fmt(avgApr, 0) + "%" : "…",  sub: "across active vaults" },
    { label: "Trackable TVL", value: totalTvl != null ? "$" + fmt(totalTvl) : "…", sub: `${pricedCount} priced vaults` },
  ];

  return (
    <main style={{ background: C.bg0, minHeight: "100vh", fontFamily: C.sans, color: C.text0, padding: "1.5rem" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>🌅 Rise Yield Optimizer</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.text2 }}>
            <span>RiseChain mainnet · reward vaults</span>
            {source === "live" && <span><span className="blink blink-green" style={{ marginRight: 5 }} />live</span>}
            {source === "mock" && <span><span className="blink blink-honey" style={{ marginRight: 5 }} />demo data</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: C.text2, marginBottom: 2, letterSpacing: "0.06em", textTransform: "uppercase" }}>RISE / USD</div>
          <div style={{ fontFamily: C.mono, fontSize: 28, fontWeight: 500, color: C.honey, lineHeight: 1, textShadow: `0 0 20px ${C.honeyGlow}` }}>
            {beraPrice ? `$${beraPrice.toFixed(2)}` : "—"}
          </div>
        </div>
      </div>

      {/* ── Stats cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: "1.75rem" }}>
        {statsCards.map((s) => (
          <div key={s.label} className="hov-card" style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1rem 1.2rem" }}>
            <div style={{ fontSize: 10, color: C.text2, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontFamily: C.mono, fontSize: 24, fontWeight: 500, lineHeight: 1.1, color: s.hi ? C.honey : C.text0 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.text2, marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Top 3 opportunities ─────────────────────────────────────── */}
      {top3.length > 0 && (
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ fontSize: 10, color: C.text2, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Top opportunities</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
            {top3.map((v, i) => {
              const p = aprPill(v.apr ?? 0);
              return (
                <div key={v.id} className={`hov-card${i === 0 ? " gold" : ""}`}
                  style={{ background: C.bg1, border: `1px solid ${i === 0 ? C.honey + "44" : C.border}`, borderRadius: 14, padding: "1.1rem 1.25rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at top left,${C.honey}07 0%,transparent 60%)`, pointerEvents: "none" }} />
                  {i === 0 && <div style={{ fontSize: 10, background: C.honeyDim, color: C.honey, padding: "2px 10px", borderRadius: 20, display: "inline-block", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>★ Highest yield</div>}
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{v.protocol}</div>
                  <div style={{ fontSize: 12, color: C.text2, marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 26, fontWeight: 500, color: p.c, lineHeight: 1, marginBottom: 2 }}>{fmt(v.apr, 0)}%</div>
                  <div style={{ fontSize: 11, color: C.text2, marginBottom: 10 }}>RISE APR</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {v.tvl != null
                      ? <span style={{ fontSize: 12, color: C.text1 }}>TVL: <span style={{ fontFamily: C.mono }}>${fmt(v.tvl)}</span></span>
                      : <span />}
                    <a href={stakeUrl(v)} target="_blank" rel="noopener noreferrer" className="lnk">Stake →</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Wallet panel ────────────────────────────────────────────── */}
      <WalletPanel vaults={vaults} beraPrice={beraPrice} />

      {/* ── Vault table ─────────────────────────────────────────────── */}
      <VaultTable initialVaults={vaults} beraPrice={beraPrice} source={source} />

      {/* ── Calculator ──────────────────────────────────────────────── */}
      <Calculator vaults={vaults} beraPrice={beraPrice} />

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.7 }}>
        <code style={{ fontFamily: C.mono, background: C.bg2, padding: "1px 6px", borderRadius: 4, fontSize: 10 }}>
          APR = rewardRate × 31536000 × RewardPrice / TVL
        </code>
        {" · "}Rewards valued at RISE price · LP TVL priced via DeFiLlama · Instantaneous APR, not historical
        {source === "mock" && " · Demo data — RPC unreachable"}
      </div>
    </main>
  );
}
