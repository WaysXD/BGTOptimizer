import { BGT, HONEY, WBERA } from "../constants";
import { validatePairAddress } from "./env";

export const PAIR_CONFIGS = [
  {
    id: "bera-honey",
    baseSymbol: "BERA",
    quoteSymbol: "HONEY",
    makerAsset: HONEY.toLowerCase(),
    takerAsset: WBERA.toLowerCase(),
    makerDecimals: 18,
    takerDecimals: 18,
    minOrderSizeWei: 10n ** 16n,
    maxOrderSizeWei: 2000n * 10n ** 18n,
    minEdgeBps: 15,
    maxSlippageBps: 50,
    maxGasUsd: 8,
    minProfitUsd: 2,
    enabled: true,
    hedgeEnabled: true,
    inventoryCapWei: 5000n * 10n ** 18n,
    cooldownMs: 45_000,
    pollIntervalMs: 15_000,
  },
  {
    id: "bgt-honey",
    baseSymbol: "BGT",
    quoteSymbol: "HONEY",
    makerAsset: BGT.toLowerCase(),
    takerAsset: HONEY.toLowerCase(),
    makerDecimals: 18,
    takerDecimals: 18,
    minOrderSizeWei: 10n ** 16n,
    maxOrderSizeWei: 500n * 10n ** 18n,
    minEdgeBps: 30,
    maxSlippageBps: 80,
    maxGasUsd: 10,
    minProfitUsd: 3,
    enabled: true,
    hedgeEnabled: false,
    inventoryCapWei: 250n * 10n ** 18n,
    cooldownMs: 60_000,
    pollIntervalMs: 20_000,
  },
];

for (const pair of PAIR_CONFIGS) {
  if (!validatePairAddress(pair.makerAsset) || !validatePairAddress(pair.takerAsset)) {
    throw new Error(`Invalid pair config addresses for ${pair.id}`);
  }
}
