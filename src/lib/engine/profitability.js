import { formatUnits } from "viem";

export function evaluateOpportunity({ order, pair, gasUsdEstimate = 0.35, hedgeCostUsd = 0, pricesUsd = {}, estimatedFeesUsd }) {
  const makingAmount = BigInt(order.makingAmount || "0");
  const takingAmount = BigInt(order.takingAmount || "0");
  const filledMaking = BigInt(order.filledMakingAmount || "0");
  const remainingMaking = makingAmount > filledMaking ? makingAmount - filledMaking : 0n;
  const remainingRatioNum = makingAmount === 0n ? 0n : remainingMaking;

  if (remainingMaking < pair.minOrderSizeWei) {
    return { executable: false, reason: "below-min-order", estimatedProfitUsd: 0, edgeBps: 0 };
  }
  if (remainingMaking > pair.maxOrderSizeWei) {
    return { executable: false, reason: "above-max-order", estimatedProfitUsd: 0, edgeBps: 0 };
  }

  const remainingTaking = makingAmount === 0n ? 0n : (takingAmount * remainingRatioNum) / makingAmount;
  const makerUnits = Number(formatUnits(remainingMaking, pair.makerDecimals));
  const takerUnits = Number(formatUnits(remainingTaking, pair.takerDecimals));

  const makerUsdPx = Number(pricesUsd[pair.makerAsset.toLowerCase()] ?? 0);
  const takerUsdPx = Number(pricesUsd[pair.takerAsset.toLowerCase()] ?? 0);
  const makerUsdValue = makerUnits * makerUsdPx;
  const takerUsdValue = takerUnits * takerUsdPx;

  if (makerUsdValue <= 0 || takerUsdValue <= 0) {
    return { executable: false, reason: "missing-price-feed", estimatedProfitUsd: 0, edgeBps: 0 };
  }

  const feeBps = Number(order?.feeConfig?.takingFeeBps || order?.feeBps || 0);
  const computedFeesUsd = estimatedFeesUsd != null ? estimatedFeesUsd : (takerUsdValue * feeBps) / 10_000;

  const edgeBps = ((makerUsdValue - takerUsdValue) / takerUsdValue) * 10_000;
  const estimatedProfitUsd = makerUsdValue - takerUsdValue - gasUsdEstimate - hedgeCostUsd - computedFeesUsd;

  if (edgeBps < pair.minEdgeBps) {
    return {
      executable: false,
      reason: `edge-too-low (${edgeBps.toFixed(2)} < ${pair.minEdgeBps} bps)`,
      estimatedProfitUsd,
      edgeBps,
    };
  }
  if (estimatedProfitUsd < pair.minProfitUsd) {
    return {
      executable: false,
      reason: `profit-too-low ($${estimatedProfitUsd.toFixed(2)} < $${pair.minProfitUsd})`,
      estimatedProfitUsd,
      edgeBps,
    };
  }
  if (gasUsdEstimate > pair.maxGasUsd) {
    return {
      executable: false,
      reason: `gas-too-high ($${gasUsdEstimate.toFixed(4)} > $${pair.maxGasUsd})`,
      estimatedProfitUsd,
      edgeBps,
    };
  }

  return {
    executable: true,
    reason: "pass",
    edgeBps,
    estimatedProfitUsd,
    estimatedFeesUsd: computedFeesUsd,
    makerUsdPx,
    takerUsdPx,
    makerUsdValue,
    takerUsdValue,
    remainingMaking: remainingMaking.toString(),
    remainingTaking: remainingTaking.toString(),
  };
}
