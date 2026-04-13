import { formatUnits } from "viem";

export function evaluateOpportunity({ order, pair, gasUsdEstimate = 0.35, hedgeCostUsd = 0 }) {
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
  const fillRate = remainingTaking === 0n ? 0 : Number(remainingMaking * 10_000n / remainingTaking);

  // Conservative: assume 1:1 nominal USD for dashboard estimate unless external pricing plugged in.
  const grossUsd = Number(formatUnits(remainingMaking, pair.makerDecimals));
  const edgeBps = Math.max(fillRate - 10_000, -10_000);
  const projectedEdgeUsd = (grossUsd * edgeBps) / 10_000;
  const estimatedProfitUsd = projectedEdgeUsd - gasUsdEstimate - hedgeCostUsd;

  if (edgeBps < pair.minEdgeBps) return { executable: false, reason: "edge-too-low", estimatedProfitUsd, edgeBps };
  if (estimatedProfitUsd < pair.minProfitUsd) return { executable: false, reason: "profit-too-low", estimatedProfitUsd, edgeBps };
  if (gasUsdEstimate > pair.maxGasUsd) return { executable: false, reason: "gas-too-high", estimatedProfitUsd, edgeBps };

  return {
    executable: true,
    reason: "pass",
    edgeBps,
    estimatedProfitUsd,
    remainingMaking: remainingMaking.toString(),
    remainingTaking: remainingTaking.toString(),
  };
}
