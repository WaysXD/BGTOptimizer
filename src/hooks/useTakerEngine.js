import { useEffect, useMemo, useRef, useState } from "react";
import { botEnv } from "../lib/config/env";
import { PAIR_CONFIGS } from "../lib/config/pairs";
import { pollPairOrders } from "../lib/engine/poller";
import { evaluateOpportunity } from "../lib/engine/profitability";
import { canExecute, createRiskState } from "../lib/engine/risk";
import { executeOpportunity } from "../lib/engine/executor";
import { loadPersistedState, savePersistedState } from "../lib/engine/persistence";

export function useTakerEngine() {
  const initial = loadPersistedState();
  const [state, setState] = useState(initial || {
    startedAt: Date.now(),
    heartbeatAt: null,
    lastPollByPair: {},
    opportunities: [],
    rejected: [],
    fills: [],
    logs: [],
    risk: createRiskState(),
    running: true,
  });

  const pairLocks = useRef({});
  const mode = botEnv.botMode;

  useEffect(() => savePersistedState(state), [state]);

  useEffect(() => {
    if (!state.running) return;

    const timers = PAIR_CONFIGS.map((pair) => setInterval(async () => {
      if (pairLocks.current[pair.id]) return;
      pairLocks.current[pair.id] = true;
      try {
        const polled = await pollPairOrders(pair);
        const now = Date.now();
        const nextLogs = [];
        const opportunities = [];
        const rejected = [];

        for (const order of polled.orders) {
          const metrics = evaluateOpportunity({ order, pair });
          const riskDecision = canExecute({ riskState: state.risk, pair, now, estimatedProfitUsd: metrics.estimatedProfitUsd });
          const candidate = { id: `${order.id}-${polled.finishedAt}`, pairId: pair.id, order, metrics, scannedAt: polled.finishedAt };
          if (metrics.executable && riskDecision.ok) {
            opportunities.push(candidate);
          } else {
            rejected.push({ ...candidate, reason: !metrics.executable ? metrics.reason : riskDecision.reason });
          }
        }

        if (opportunities.length > 0) {
          const best = opportunities.sort((a, b) => b.metrics.estimatedProfitUsd - a.metrics.estimatedProfitUsd)[0];
          const fill = await executeOpportunity({ mode, opportunity: best, pair, takerAddress: orderToAddress(best.order) });
          const fillRecord = { ...best, fill, executedAt: Date.now() };
          setState((prev) => ({
            ...prev,
            heartbeatAt: now,
            lastPollByPair: { ...prev.lastPollByPair, [pair.id]: polled.finishedAt },
            opportunities: [best, ...prev.opportunities].slice(0, 300),
            rejected: [...rejected, ...prev.rejected].slice(0, 300),
            fills: [fillRecord, ...prev.fills].slice(0, 300),
            logs: [{ level: "info", message: `Fill ${fill.status} for ${pair.id}`, at: now }, ...prev.logs].slice(0, 500),
          }));
        } else {
          nextLogs.push({ level: "debug", message: `No executable orders for ${pair.id}`, at: now });
          setState((prev) => ({
            ...prev,
            heartbeatAt: now,
            lastPollByPair: { ...prev.lastPollByPair, [pair.id]: polled.finishedAt },
            opportunities: [...opportunities, ...prev.opportunities].slice(0, 300),
            rejected: [...rejected, ...prev.rejected].slice(0, 300),
            logs: [...nextLogs, ...prev.logs].slice(0, 500),
          }));
        }
      } catch (error) {
        setState((prev) => ({ ...prev, logs: [{ level: "error", message: error.message, at: Date.now() }, ...prev.logs].slice(0, 500) }));
      } finally {
        pairLocks.current[pair.id] = false;
      }
    }, pair.pollIntervalMs));

    return () => timers.forEach(clearInterval);
  }, [mode, state.running, state.risk]);

  const overview = useMemo(() => ({
    uptimeMs: Date.now() - state.startedAt,
    opportunities: state.opportunities.length,
    rejected: state.rejected.length,
    fills: state.fills.length,
    mode,
    heartbeatAt: state.heartbeatAt,
    enabledPairs: PAIR_CONFIGS.filter((p) => p.enabled).length,
  }), [state, mode]);

  return {
    state,
    overview,
    pairs: PAIR_CONFIGS,
    setRunning: (running) => setState((prev) => ({ ...prev, running })),
    setGlobalPause: (pause) => setState((prev) => ({ ...prev, risk: { ...prev.risk, globalPause: pause } })),
    emergencyStop: () => setState((prev) => ({ ...prev, risk: { ...prev.risk, emergencyStop: true }, running: false })),
    clearLogs: () => setState((prev) => ({ ...prev, logs: [] })),
  };
}

function orderToAddress(order) {
  return typeof order?.taker === "string" && order.taker.startsWith("0x") ? order.taker : (order?.maker || "0x0000000000000000000000000000000000000000");
}
