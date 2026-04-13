import { fetchOrdersByPair } from "../kyber/takerClient";

export async function pollPairOrders(pair) {
  const startedAt = Date.now();
  const orders = await fetchOrdersByPair({ makerAsset: pair.makerAsset, takerAsset: pair.takerAsset });
  return { orders, startedAt, finishedAt: Date.now() };
}
