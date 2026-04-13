import { botEnv } from "../config/env";

const DEFAULT_CHAIN_ID = "80094";

async function request(path, options = {}) {
  const response = await fetch(`${botEnv.kyberLimitOrderApiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-client-id": botEnv.kyberClientId,
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok || Number(data?.code ?? -1) !== 0) {
    throw new Error(data?.message || `Kyber LO API error ${response.status}`);
  }
  return data.data;
}

export async function fetchOrdersByPair({ makerAsset, takerAsset, chainId = DEFAULT_CHAIN_ID }) {
  const params = new URLSearchParams({ chainId, makerAsset, takerAsset });
  const data = await request(`/read-partner/api/v1/orders?${params.toString()}`);
  return Array.isArray(data?.orders) ? data.orders : [];
}

export async function fetchOperatorSignatures({ orderIds, chainId = DEFAULT_CHAIN_ID }) {
  const params = new URLSearchParams({ chainId, orderIds: orderIds.join(",") });
  const data = await request(`/read-partner/api/v1/orders/operator-signature?${params.toString()}`);
  return Array.isArray(data) ? data : [];
}

export async function encodeFillOrder({ orderId, takingAmount, thresholdAmount, target, operatorSignature }) {
  return request(`/read-ks/api/v1/encode/fill-order-to`, {
    method: "POST",
    body: JSON.stringify({ orderId: Number(orderId), takingAmount, thresholdAmount, target, operatorSignature }),
  });
}
