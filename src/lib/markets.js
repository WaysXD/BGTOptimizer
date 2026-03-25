const MARKETS_API = "/api/markets";
const LLAMA_YIELDS = "https://yields.llama.fi/pools";
const DEBUG = import.meta.env.VITE_DEBUG_MARKETS === "1";

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
  async function fetchFromApi() {
    const response = await fetch(MARKETS_API);
    if (!response.ok) throw new Error(`Markets HTTP ${response.status}`);
    const payload = await response.json();
    const markets = Array.isArray(payload?.markets) ? payload.markets : [];
    return { payload, markets };
  }

  async function fetchFromLlamaClientFallback() {
    const response = await fetch(LLAMA_YIELDS);
    if (!response.ok) throw new Error(`DefiLlama HTTP ${response.status}`);
    const payload = await response.json();
    const rawPools = payload?.data || [];
    const markets = (payload?.data || [])
      .filter((pool) => String(pool.chain || "").toLowerCase().includes("berachain"))
      .filter((pool) => {
        const p = String(pool.project || "").toLowerCase();
        return p.includes("beradrome") || p.includes("arbera") || p.includes("kodiak");
      })
      .map((pool) => ({
        id: `${pool.project}:${pool.pool}`,
        protocol: String(pool.project || "unknown"),
        marketName: pool.symbol || pool.pool || "Unavailable",
        category: "lp",
        aprTotal: Number.isFinite(Number(pool.apr)) ? Number(pool.apr) : null,
        apyTotal: Number.isFinite(Number(pool.apy)) ? Number(pool.apy) : null,
        tvlUsd: Number.isFinite(Number(pool.tvlUsd)) ? Number(pool.tvlUsd) : null,
        marketUrl: null,
        status: "active",
        depositTokens: Array.isArray(pool.underlyingTokens) ? pool.underlyingTokens : [],
        sourceUpdatedAt: typeof pool.timestamp === "number" ? new Date(pool.timestamp * 1000).toISOString() : null,
        sourceType: "defillama",
      }));
    if (DEBUG) {
      console.info("[markets] client fallback counts", {
        rawPools: rawPools.length,
        chainMatched: rawPools.filter((pool) => String(pool.chain || "").toLowerCase().includes("berachain")).length,
        protocolMatched: markets.length,
      });
    }
    return { payload: { warnings: ["Using client fallback to DefiLlama"], cache: "bypass" }, markets };
  }

  let payload;
  let markets;
  try {
    ({ payload, markets } = await fetchFromApi());
    if (!markets.length) {
      console.warn("[markets] API returned zero markets; activating client fallback");
      ({ payload, markets } = await fetchFromLlamaClientFallback());
    }
  } catch (err) {
    console.warn("[markets] API fetch failed; activating client fallback", err);
    ({ payload, markets } = await fetchFromLlamaClientFallback());
  }

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

  if (DEBUG) {
    console.info("[markets] normalization counts", {
      rawFetched: markets.length,
      normalized: normalized.length,
      active: normalized.filter((v) => v.active !== false).length,
      priced: normalized.filter((v) => v.tvl != null && Number.isFinite(v.tvl)).length,
      aprReady: normalized.filter((v) => v.apr != null && Number.isFinite(v.apr)).length,
    });
  }

  return {
    vaults: normalized,
    beraPrice: null,
    warnings: payload?.warnings || [],
    sourceUpdatedAt: payload?.updatedAt || null,
    cache: payload?.cache || null,
  };
}
