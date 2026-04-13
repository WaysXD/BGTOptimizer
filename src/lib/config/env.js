import { isAddress } from "viem";

function fromEnv(key, fallback = "") {
  return import.meta.env[key] ?? import.meta.env[`VITE_${key}`] ?? fallback;
}

const mode = fromEnv("BOT_MODE", "dry-run");
const privateKey = fromEnv("BOT_PRIVATE_KEY", "");

export const botEnv = {
  berachainRpcUrl: fromEnv("BERACHAIN_RPC_URL", "https://rpc.berachain.com"),
  kyberLimitOrderApiBaseUrl: fromEnv("KYBER_LIMIT_ORDER_API_BASE_URL", "https://limit-order.kyberswap.com"),
  kyberAggregatorApiBaseUrl: fromEnv("KYBER_AGGREGATOR_API_BASE_URL", "https://aggregator-api.kyberswap.com"),
  kyberClientId: fromEnv("KYBER_CLIENT_ID", "BerachainTakerDashboard"),
  botMode: mode === "live" ? "live" : "dry-run",
  defaultMinEdgeBps: Number(fromEnv("DEFAULT_MIN_EDGE_BPS", "15")),
  defaultMaxGasUsd: Number(fromEnv("DEFAULT_MAX_GAS_USD", "0.10")),
  defaultMinProfitUsd: Number(fromEnv("DEFAULT_MIN_PROFIT_USD", "2")),
  hedgeEnabled: fromEnv("HEDGE_ENABLED", "false") === "true",
  hasServerSigner: privateKey.startsWith("0x") && privateKey.length === 66,
};

export function validateEnvForLive() {
  if (botEnv.botMode !== "live") return { ok: true };
  const errors = [];
  if (!botEnv.berachainRpcUrl.startsWith("http")) errors.push("Invalid BERACHAIN_RPC_URL");
  if (!botEnv.kyberLimitOrderApiBaseUrl.startsWith("http")) errors.push("Invalid KYBER_LIMIT_ORDER_API_BASE_URL");
  if (!botEnv.kyberClientId) errors.push("Missing KYBER_CLIENT_ID");
  if (!botEnv.hasServerSigner) errors.push("BOT_PRIVATE_KEY missing/invalid (server-side only)");
  return { ok: errors.length === 0, errors };
}

export function validatePairAddress(address) {
  return isAddress(address);
}
