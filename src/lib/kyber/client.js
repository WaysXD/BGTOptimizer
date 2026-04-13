import { isAddress } from "viem";
import { BERACHAIN_CHAIN_SLUG } from "../chains/berachain";
import { DEFAULT_KYBER_BASE_URL } from "./types";
import { normalizeBuildResponse, normalizeQuoteResponse } from "./normalize";

const BASE_URL = (import.meta.env.NEXT_PUBLIC_KYBER_AGGREGATOR_API_BASE_URL || import.meta.env.VITE_KYBER_AGGREGATOR_API_BASE_URL || DEFAULT_KYBER_BASE_URL).replace(/\/$/, "");
const CLIENT_ID = import.meta.env.NEXT_PUBLIC_KYBER_CLIENT_ID || import.meta.env.VITE_KYBER_CLIENT_ID || "BGTOptimizer";

function parseFeeConfig() {
  const recipient = import.meta.env.NEXT_PUBLIC_SWAP_FEE_RECIPIENT || import.meta.env.VITE_SWAP_FEE_RECIPIENT;
  const bpsRaw = import.meta.env.NEXT_PUBLIC_SWAP_FEE_BPS || import.meta.env.VITE_SWAP_FEE_BPS;
  if (!recipient || !bpsRaw) return { enabled: false };
  const bps = Number(bpsRaw);
  if (!isAddress(recipient) || !Number.isInteger(bps) || bps <= 0 || bps > 1000) {
    console.warn("Invalid swap fee config; fee injection disabled.");
    return { enabled: false };
  }
  return { enabled: true, recipient, bps };
}

export const kyberFeeConfig = parseFeeConfig();

async function kyberFetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}/${BERACHAIN_CHAIN_SLUG}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-client-id": CLIENT_ID,
      ...options.headers,
    },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || (json.code && Number(json.code) !== 0)) {
    const message = json?.message || `Kyber API error (${response.status})`;
    throw new Error(message);
  }
  return json;
}

export async function getKyberRoute(query, signal) {
  const params = new URLSearchParams({
    tokenIn: query.tokenIn,
    tokenOut: query.tokenOut,
    amountIn: query.amountIn,
    gasInclude: String(query.gasInclude ?? true),
  });

  if (query.origin) params.set("origin", query.origin);
  if (kyberFeeConfig.enabled) {
    params.set("feeAmount", String(kyberFeeConfig.bps));
    params.set("isInBps", "true");
    params.set("chargeFeeBy", query.chargeFeeBy || "currency_in");
    params.set("feeReceiver", kyberFeeConfig.recipient);
  }

  const payload = await kyberFetch(`/routes?${params.toString()}`, { signal });
  return normalizeQuoteResponse(payload);
}

export async function buildKyberSwapTx({ routeSummary, sender, recipient, slippageBps, enableGasEstimation = true }) {
  const payload = await kyberFetch("/route/build", {
    method: "POST",
    body: JSON.stringify({
      routeSummary,
      sender,
      recipient,
      slippageTolerance: slippageBps,
      enableGasEstimation,
    }),
  });

  return normalizeBuildResponse(payload);
}
