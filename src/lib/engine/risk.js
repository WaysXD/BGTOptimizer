export function createRiskState() {
  return {
    globalPause: false,
    emergencyStop: false,
    maxDailyLossUsd: 150,
    maxFillsPerHour: 15,
    fillsThisHour: [],
    dailyPnlUsd: 0,
    tokenInventory: {},
  };
}

export function canExecute({ riskState, pair, now, estimatedProfitUsd }) {
  if (riskState.globalPause || riskState.emergencyStop) return { ok: false, reason: "paused" };
  if (riskState.dailyPnlUsd < -Math.abs(riskState.maxDailyLossUsd)) return { ok: false, reason: "daily-loss-limit" };

  const hourAgo = now - 3_600_000;
  riskState.fillsThisHour = riskState.fillsThisHour.filter((ts) => ts > hourAgo);
  if (riskState.fillsThisHour.length >= riskState.maxFillsPerHour) return { ok: false, reason: "fills-per-hour-limit" };

  if (estimatedProfitUsd <= 0) return { ok: false, reason: "non-positive-profit" };
  if (!pair.enabled) return { ok: false, reason: "pair-disabled" };
  return { ok: true, reason: "ok" };
}
