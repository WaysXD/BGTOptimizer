const MARKETS_API = "/api/markets";

function toType(category) {
  if (category === "vault") return "Vault";
  if (category === "farm") return "Farm";
  if (category === "lp") return "LP";
  if (category === "staking") return "Staking";
  if (category === "reward-vault") return "Reward";
  return "Other";
}

function firstTokenSymbol(token) {
  if (!token) return null;
  if (token.startsWith("0x")) return `${token.slice(0, 6)}…${token.slice(-4)}`;
  return token;
}

function bestApr(market) {
  if (market.aprTotal != null) return { value: market.aprTotal, label: "APR" };
  if (market.apyTotal != null) return { value: market.apyTotal, label: "APY" };
  return { value: null, label: "APR" };
}

function freshnessLabel(sourceUpdatedAt) {
  if (!sourceUpdatedAt) return "Unavailable";
  const t = Date.parse(sourceUpdatedAt);
  if (Number.isNaN(t)) return "Unavailable";
  const minutes = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function loadMarkets() {
  const response = await fetch(MARKETS_API);
  if (!response.ok) throw new Error(`Markets HTTP ${response.status}`);
  const payload = await response.json();
  const markets = Array.isArray(payload?.markets) ? payload.markets : [];

  const normalized = markets.map((market, idx) => {
    const apr = bestApr(market);
    const tokenLabel = market.depositTokens?.[0] ? firstTokenSymbol(market.depositTokens[0]) : null;

    return {
      id: market.id || idx + 1,
      vault: null,
      symbol: tokenLabel,
      name: market.marketName || market.displayName || "Unavailable",
      protocol: market.protocol || "Unknown",
      type: toType(market.category),
      apr: apr.value,
      aprLabel: apr.label,
      bgtPerDay: null,
      tvl: market.tvlUsd ?? null,
      totalSupply: null,
      active: market.status !== "inactive",
      stakingToken: market.depositTokens?.[0] || null,
      marketUrl: market.marketUrl || null,
      sourceUpdatedAt: market.sourceUpdatedAt || null,
      sourceFreshness: freshnessLabel(market.sourceUpdatedAt),
      sourceType: market.sourceType || "other",
    };
  });

  return {
    vaults: normalized,
    beraPrice: null,
    warnings: payload?.warnings || [],
    sourceUpdatedAt: payload?.updatedAt || null,
    cache: payload?.cache || null,
  };
}
