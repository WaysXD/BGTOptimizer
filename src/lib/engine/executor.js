import { encodeFillOrder, fetchOperatorSignatures } from "../kyber/takerClient";
import { maybeHedge } from "./hedger";

export async function executeOpportunity({ mode, opportunity, pair, takerAddress }) {
  if (mode !== "live") {
    const hedge = await maybeHedge({ enabled: pair.hedgeEnabled, fill: opportunity, pair, mode, walletAddress: takerAddress });
    return {
      status: "dry-run",
      txHash: null,
      encoded: null,
      hedge,
    };
  }

  const signatures = await fetchOperatorSignatures({ orderIds: [Number(opportunity.order.id)] });
  const operatorSignature = signatures?.[0]?.operatorSignature;
  if (!operatorSignature) throw new Error("Missing operator signature");

  const encoded = await encodeFillOrder({
    orderId: Number(opportunity.order.id),
    takingAmount: opportunity.metrics.remainingTaking,
    thresholdAmount: "0",
    target: takerAddress,
    operatorSignature,
  });

  const response = await fetch("/api/bot/fill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: encoded.to,
      data: encoded.data,
      value: encoded.value ?? "0",
      gasLimit: encoded.gas,
    }),
  });
  const tx = await response.json();
  if (!response.ok) throw new Error(tx.error || "Fill execution failed");

  const hedge = await maybeHedge({ enabled: pair.hedgeEnabled, fill: opportunity, pair, mode, walletAddress: takerAddress });
  return { status: "submitted", txHash: tx.hash, encoded, hedge };
}
