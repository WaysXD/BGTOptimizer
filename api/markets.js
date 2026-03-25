const DEFAULT_TTL_MS = Number(process.env.MARKETS_CACHE_TTL_MS || 60_000);
const BERACHAIN_CHAIN_KEY = "berachain";

const DEFAULT_PROTOCOL_URLS = {
  Beradrome: "https://www.beradrome.com/",
  Arbera: "https://app.arbera.io/",
  Kodiak: "https://app.kodiak.finance/",
};

const OFFICIAL_ENDPOINTS = {
  Beradrome: process.env.BERADROME_MARKETS_API_URL || "",
  Arbera: process.env.ARBERA_MARKETS_API_URL || "",
  Kodiak: process.env.KODIAK_MARKETS_API_URL || "",
};
const DEBUG = process.env.DEBUG_MARKETS === "1";

let cache = {
  ts: 0,
  payload: null,
};

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeCategory(raw = "") {
  const value = String(raw).toLowerCase();
  if (value.includes("vault")) return "vault";
  if (value.includes("farm")) return "farm";
  if (value.includes("lp") || value.includes("pool")) return "lp";
  if (value.includes("stake")) return "staking";
  if (value.includes("reward")) return "reward-vault";
  return "other";
}

function normalizeStatus(raw) {
  if (raw === true) return "active";
  if (raw === false) return "inactive";
  const value = String(raw ?? "").toLowerCase();
  if (["active", "live", "open", "enabled"].includes(value)) return "active";
  if (["inactive", "closed", "disabled", "expired"].includes(value)) return "inactive";
  return "unknown";
}

function toIsoMaybe(input) {
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapLlamaPoolToMarket(pool) {
  const apy = safeNumber(pool.apy);
  const apr = safeNumber(pool.apr);
  const status = pool.poolMeta?.toLowerCase().includes("outdated") ? "inactive" : "active";
  return {
    id: `${pool.project}:${pool.pool}`,
    protocol: pool.project,
    marketName: pool.symbol || pool.pool,
    displayName: `${pool.project} ${pool.symbol || "market"}`,
    category: normalizeCategory(pool.exposure || pool.poolMeta || "lp"),
    depositTokens: Array.isArray(pool.underlyingTokens) ? pool.underlyingTokens : [],
    rewardTokens: Array.isArray(pool.rewardTokens) ? pool.rewardTokens : [],
    aprBase: apr,
    aprRewards: null,
    aprTotal: apr,
    apyTotal: apy,
    tvlUsd: safeNumber(pool.tvlUsd),
    marketUrl: null,
    contractAddress: pool.pool || null,
    sourceType: "defillama",
    sourceName: "DefiLlama yields API",
    sourceUpdatedAt: toIsoMaybe(
      typeof pool.timestamp === "number" ? pool.timestamp * 1000 : (pool.timestamp || pool.predictions?.predictedClass)
    ),
    chain: BERACHAIN_CHAIN_KEY,
    status,
    confidence: "medium",
  };
}

async function fetchJsonWithRetry(url, retries = 2) {
  let lastError = null;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function mapOfficialEntry(protocol, raw) {
  const aprBase = safeNumber(raw.aprBase ?? raw.baseApr ?? raw.apr);
  const aprRewards = safeNumber(raw.aprRewards ?? raw.rewardsApr);
  const aprTotal = safeNumber(raw.aprTotal ?? (aprBase != null || aprRewards != null ? (aprBase || 0) + (aprRewards || 0) : null));
  const apyTotal = safeNumber(raw.apyTotal ?? raw.apy);
  const depositTokens = Array.isArray(raw.depositTokens)
    ? raw.depositTokens
    : (Array.isArray(raw.underlyingTokens) ? raw.underlyingTokens : []);
  const rewardTokens = Array.isArray(raw.rewardTokens) ? raw.rewardTokens : [];

  return {
    id: `${protocol.toLowerCase()}:${raw.id || raw.marketId || raw.address || raw.pool || raw.name || Math.random().toString(16).slice(2)}`,
    protocol,
    marketName: raw.marketName || raw.name || raw.symbol || "Unnamed market",
    displayName: raw.displayName || raw.marketName || raw.name || "Unnamed market",
    category: normalizeCategory(raw.category || raw.type),
    depositTokens,
    rewardTokens,
    aprBase,
    aprRewards,
    aprTotal,
    apyTotal,
    tvlUsd: safeNumber(raw.tvlUsd ?? raw.tvl),
    marketUrl: raw.marketUrl || raw.url || DEFAULT_PROTOCOL_URLS[protocol] || null,
    contractAddress: raw.contractAddress || raw.address || raw.pool || null,
    sourceType: "official-api",
    sourceName: `${protocol} official API`,
    sourceUpdatedAt: toIsoMaybe(raw.sourceUpdatedAt || raw.updatedAt || raw.timestamp),
    chain: BERACHAIN_CHAIN_KEY,
    status: normalizeStatus(raw.status ?? raw.active),
    confidence: "high",
  };
}

async function runOfficialAdapter(protocol, endpoint) {
  if (!endpoint) return { markets: [], warning: `${protocol}: endpoint not configured` };
  if (DEBUG) console.info(`[markets] ${protocol} official adapter start`, endpoint);
  const json = await fetchJsonWithRetry(endpoint, 1);
  const rows = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.markets)
        ? json.markets
        : [];
  const markets = rows.map((entry) => mapOfficialEntry(protocol, entry)).filter((m) => m.status !== "inactive");
  if (DEBUG) console.info(`[markets] ${protocol} official adapter done`, { rows: rows.length, markets: markets.length });
  return { markets, warning: null };
}

function isTargetProtocol(rawProject = "") {
  const project = String(rawProject || "").toLowerCase();
  return project.includes("beradrome") || project.includes("arbera") || project.includes("kodiak");
}

function dedupeMarkets(markets) {
  const byKey = new Map();
  for (const market of markets) {
    const key = `${market.protocol.toLowerCase()}::${(market.contractAddress || market.marketName).toLowerCase()}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, market);
      continue;
    }

    const existingRank = existing.sourceType === "official-api" ? 2 : 1;
    const currentRank = market.sourceType === "official-api" ? 2 : 1;
    if (currentRank > existingRank) {
      byKey.set(key, market);
      continue;
    }

    if (currentRank === existingRank) {
      const existingTs = existing.sourceUpdatedAt ? Date.parse(existing.sourceUpdatedAt) : 0;
      const currentTs = market.sourceUpdatedAt ? Date.parse(market.sourceUpdatedAt) : 0;
      if (currentTs > existingTs) byKey.set(key, market);
    }
  }
  return [...byKey.values()];
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (cache.payload && Date.now() - cache.ts < DEFAULT_TTL_MS) {
    return res.status(200).json({ ...cache.payload, cache: "hit" });
  }

  const warnings = [];
  const official = [];
  const officialResults = await Promise.allSettled(
    Object.entries(OFFICIAL_ENDPOINTS).map(async ([protocol, endpoint]) => ({ protocol, ...(await runOfficialAdapter(protocol, endpoint)) }))
  );
  for (const result of officialResults) {
    if (result.status === "fulfilled") {
      if (result.value.warning) warnings.push(result.value.warning);
      official.push(...result.value.markets);
      continue;
    }
    warnings.push(`official adapter failed (${result.reason?.message || "unknown"})`);
  }

  let llamaPools = [];
  try {
    const llama = await fetchJsonWithRetry("https://yields.llama.fi/pools", 1);
    if (DEBUG) console.info("[markets] defillama payload", { total: llama?.data?.length || 0 });
    llamaPools = (llama?.data || [])
      .filter((pool) => String(pool.chain || "").toLowerCase() === BERACHAIN_CHAIN_KEY)
      .filter((pool) => isTargetProtocol(pool.project))
      .map(mapLlamaPoolToMarket)
      .filter((m) => m.status !== "inactive");
    if (DEBUG) console.info("[markets] defillama mapped", { markets: llamaPools.length });
  } catch (err) {
    warnings.push(`DefiLlama fallback failed (${err.message})`);
  }

  const markets = dedupeMarkets([...official, ...llamaPools])
    .filter((m) => m.status === "active")
    .map((m) => ({
      ...m,
      protocol: m.protocol.charAt(0).toUpperCase() + m.protocol.slice(1),
      marketUrl: m.marketUrl || DEFAULT_PROTOCOL_URLS[m.protocol] || null,
    }));

  const payload = {
    chain: BERACHAIN_CHAIN_KEY,
    updatedAt: new Date().toISOString(),
    markets,
    warnings,
    stats: {
      officialCount: official.length,
      defillamaCount: llamaPools.length,
      activeCount: markets.length,
    },
  };
  console.info("[markets] response", {
    official: official.length,
    defillama: llamaPools.length,
    merged: markets.length,
    warnings: warnings.length,
  });

  cache = { ts: Date.now(), payload };
  return res.status(200).json({ ...payload, cache: "miss" });
};
