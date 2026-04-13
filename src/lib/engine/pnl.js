export function createPnlState() {
  return {
    realizedUsd: 0,
    unrealizedUsd: 0,
    inventory: {},
    history: [],
  };
}

function clonePnl(pnl) {
  return {
    realizedUsd: Number(pnl.realizedUsd || 0),
    unrealizedUsd: Number(pnl.unrealizedUsd || 0),
    inventory: { ...(pnl.inventory || {}) },
    history: [...(pnl.history || [])],
  };
}

export function applyFillToPnl({ pnl, fillRecord, pricesUsd }) {
  const next = clonePnl(pnl);
  const pair = fillRecord.pair;
  const inToken = pair.takerAsset.toLowerCase();
  const outToken = pair.makerAsset.toLowerCase();
  const takingUnits = Number(fillRecord.metrics.remainingTaking || "0") / 1e18;
  const makingUnits = Number(fillRecord.metrics.remainingMaking || "0") / 1e18;

  next.inventory[inToken] = Number(next.inventory[inToken] || 0) - takingUnits;
  next.inventory[outToken] = Number(next.inventory[outToken] || 0) + makingUnits;

  const realized = Number(fillRecord.metrics.estimatedProfitUsd || 0);
  next.realizedUsd += realized;
  next.history.unshift({ at: Date.now(), type: "fill", realizedUsd: realized, id: fillRecord.id });

  let unrealized = 0;
  for (const [token, units] of Object.entries(next.inventory)) {
    const px = Number(pricesUsd[token] || 0);
    unrealized += Number(units) * px;
  }
  next.unrealizedUsd = unrealized;
  return next;
}

export function applyHedgeToPnl({ pnl, hedgeRecord }) {
  const next = clonePnl(pnl);
  if (hedgeRecord.status === "hedged") {
    next.history.unshift({ at: Date.now(), type: "hedge", txHash: hedgeRecord.txHash });
  }
  return next;
}
