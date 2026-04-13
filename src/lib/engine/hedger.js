import { buildKyberSwapTx, getKyberRoute } from "../kyber/client";

export async function maybeHedge({ enabled, fill, pair, mode, walletAddress }) {
  if (!enabled || !pair.hedgeEnabled) return { status: "unhedged", reason: "disabled" };

  const tokenIn = pair.makerAsset;
  const tokenOut = pair.takerAsset;
  const amountIn = fill.metrics?.remainingMaking || fill.makingAmount;

  if (!amountIn) return { status: "skipped", reason: "missing-amount" };

  const quote = await getKyberRoute({ tokenIn, tokenOut, amountIn: String(amountIn), origin: walletAddress });

  if (mode !== "live") {
    return {
      status: "simulated",
      reason: "dry-run",
      amountOut: quote.amountOut,
      route: quote.routeText,
      estimatedUsdDelta: Number(fill.metrics?.makerUsdValue || 0) - Number(fill.metrics?.takerUsdValue || 0),
    };
  }

  const built = await buildKyberSwapTx({
    routeSummary: quote.routeSummary,
    sender: walletAddress,
    recipient: walletAddress,
    slippageBps: pair.maxSlippageBps,
  });

  const response = await fetch("/api/bot/fill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: built.routerAddress,
      data: built.calldata,
      value: built.value,
      gasLimit: built.gasLimit?.toString?.(),
    }),
  });
  const tx = await response.json();
  if (!response.ok) {
    return { status: "failed", reason: tx.error || "hedge-tx-failed" };
  }

  return { status: "hedged", txHash: tx.hash, amountOut: quote.amountOut, route: quote.routeText };
}
