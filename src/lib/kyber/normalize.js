function toSafeString(v) {
  return typeof v === "string" ? v : "";
}

export function normalizeQuoteResponse(payload) {
  const data = payload?.data;
  if (!data || typeof data !== "object" || !data.routeSummary || !data.routerAddress) {
    throw new Error("Kyber quote response is missing route details");
  }

  const summary = data.routeSummary;
  const amountOut = toSafeString(summary.amountOut);
  const amountIn = toSafeString(summary.amountIn);
  if (!amountIn || !amountOut) {
    throw new Error("Kyber route has empty input/output amounts");
  }

  const route = Array.isArray(summary.route)
    ? summary.route.map((hop) => hop?.pool?.toString?.() ?? "Pool").join(" → ")
    : "Best route";

  const extra = summary.extra ?? {};

  return {
    routeSummary: summary,
    routerAddress: String(data.routerAddress),
    requestId: payload?.requestId,
    amountOut,
    amountIn,
    gas: toSafeString(summary.gas),
    gasUsd: toSafeString(summary.gasUsd),
    priceImpact: typeof summary.priceImpact === "number" ? summary.priceImpact : Number(summary.priceImpact ?? 0),
    routeText: route,
    feeAmount: toSafeString(extra.feeAmount),
    feeTokenAddress: toSafeString(extra.feeToken),
  };
}

export function normalizeBuildResponse(payload) {
  const data = payload?.data;
  if (!data || typeof data !== "object") {
    throw new Error("Kyber build response missing data");
  }
  if (!data.data || !data.routerAddress) {
    throw new Error("Kyber build response missing calldata or router");
  }
  return {
    calldata: String(data.data),
    routerAddress: String(data.routerAddress),
    value: String(data.amountIn ?? "0"),
    gasLimit: data.gas ? BigInt(data.gas) : undefined,
  };
}
