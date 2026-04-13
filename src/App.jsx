import { useMemo } from "react";
import { C } from "./lib/constants";
import { botEnv, validateEnvForLive } from "./lib/config/env";
import { useTakerEngine } from "./hooks/useTakerEngine";
import MetricCard from "./components/dashboard/MetricCard";
import DataTable from "./components/dashboard/DataTable";
import "./App.css";

export default function App() {
  const { state, overview, pairs, setRunning, setGlobalPause, emergencyStop, clearLogs } = useTakerEngine();
  const envCheck = validateEnvForLive();

  const fillRows = useMemo(() => state.fills.map((f) => ({
    id: f.id,
    pair: f.pairId,
    status: f.fill.status,
    txHash: f.fill.txHash,
    profit: f.metrics.estimatedProfitUsd?.toFixed?.(3),
    hedge: f.fill.hedge?.status,
    at: new Date(f.executedAt).toLocaleTimeString(),
  })), [state.fills]);

  return (
    <main style={{ background: C.bg0, minHeight: "100vh", fontFamily: C.sans, color: C.text0, padding: "1.3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>Berachain Taker Engine</div>
          <div style={{ color: C.text2, fontSize: 12 }}>Kyber Limit Order monitor + profitability + execution dashboard (chainId 80094 only)</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="pill-btn on" onClick={() => setRunning(!state.running)}>{state.running ? "Stop" : "Start"}</button>
          <button className="pill-btn" onClick={() => setGlobalPause(!state.risk.globalPause)}>{state.risk.globalPause ? "Unpause" : "Global Pause"}</button>
          <button className="pill-btn" onClick={emergencyStop}>Emergency Stop</button>
        </div>
      </div>

      {!envCheck.ok && (
        <div style={{ background: C.redDim, color: C.red, border: `1px solid ${C.red}`, borderRadius: 10, padding: 10, marginBottom: 12 }}>
          Live mode env validation failed: {envCheck.errors.join(", ")}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
        <MetricCard label="Bot mode" value={overview.mode} sub={botEnv.hasServerSigner ? "server signer configured" : "server signer missing"} />
        <MetricCard label="Heartbeat" value={overview.heartbeatAt ? new Date(overview.heartbeatAt).toLocaleTimeString() : "never"} />
        <MetricCard label="Uptime" value={`${Math.floor(overview.uptimeMs / 1000)}s`} />
        <MetricCard label="Opportunities" value={overview.opportunities} />
        <MetricCard label="Fills" value={overview.fills} />
        <MetricCard label="Pairs enabled" value={overview.enabledPairs} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <DataTable title="Pair Configuration" columns={[
          { key: "id", label: "Pair" },
          { key: "thresholds", label: "Thresholds", render: (r) => `edge ${r.minEdgeBps}bps | minProfit $${r.minProfitUsd}` },
          { key: "risk", label: "Risk", render: (r) => `maxGas $${r.maxGasUsd} | cap ${r.inventoryCapWei}` },
          { key: "hedgeEnabled", label: "Hedge" },
        ]} rows={pairs} />
        <DataTable title="Recent Opportunities" columns={[
          { key: "pairId", label: "Pair" },
          { key: "edge", label: "Edge bps", render: (r) => r.metrics?.edgeBps ?? "—" },
          { key: "profit", label: "Est. Profit USD", render: (r) => r.metrics?.estimatedProfitUsd?.toFixed?.(3) ?? "—" },
          { key: "orderId", label: "Order", render: (r) => r.order?.id },
          { key: "time", label: "Scanned", render: (r) => new Date(r.scannedAt).toLocaleTimeString() },
        ]} rows={state.opportunities.slice(0, 50)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <DataTable title="Recent Fills" columns={[
          { key: "pair", label: "Pair" },
          { key: "status", label: "Status" },
          { key: "profit", label: "Est. USD" },
          { key: "hedge", label: "Hedge" },
          { key: "txHash", label: "Tx", render: (r) => r.txHash ? <span style={{ fontFamily: C.mono }}>{r.txHash.slice(0, 12)}…</span> : "dry-run" },
          { key: "at", label: "At" },
        ]} rows={fillRows.slice(0, 50)} />
        <DataTable title="Rejections" columns={[
          { key: "pairId", label: "Pair" },
          { key: "reason", label: "Reason" },
          { key: "edge", label: "Edge", render: (r) => r.metrics?.edgeBps ?? "—" },
          { key: "profit", label: "Est. USD", render: (r) => r.metrics?.estimatedProfitUsd?.toFixed?.(3) ?? "—" },
          { key: "at", label: "At", render: (r) => new Date(r.scannedAt).toLocaleTimeString() },
        ]} rows={state.rejected.slice(0, 50)} />
      </div>

      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontWeight: 600 }}>Logs / Diagnostics</div>
          <button className="pill-btn" onClick={clearLogs}>Clear logs</button>
        </div>
        <div style={{ maxHeight: 180, overflow: "auto", fontFamily: C.mono, fontSize: 11 }}>
          {state.logs.length === 0 ? <div style={{ color: C.text2 }}>No logs yet.</div> : state.logs.slice(0, 200).map((log, idx) => (
            <div key={`${log.at}-${idx}`} style={{ color: log.level === "error" ? C.red : log.level === "debug" ? C.text2 : C.green }}>[{new Date(log.at).toLocaleTimeString()}] {log.level}: {log.message}</div>
          ))}
        </div>
      </div>
    </main>
  );
}
