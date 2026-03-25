// Client-side DeFiLlama price fetching.
import { PRICE_KEY, PRICE_NAMESPACE } from "./constants";

const LLAMA_COINS = "https://coins.llama.fi/prices/current";

export async function fetchPrices(addresses) {
  if (!addresses.length) return {};
  try {
    const coins = addresses.map((a) => `${PRICE_NAMESPACE}:${a.toLowerCase()}`).join(",");
    const res   = await fetch(`${LLAMA_COINS}/${coins}`);
    if (!res.ok) return {};
    const data  = await res.json();
    const out   = {};
    for (const [key, val] of Object.entries(data.coins ?? {})) {
      const addr = key.split(":")[1];
      if (addr && val?.price != null) out[addr] = val.price;
    }
    return out;
  } catch {
    return {};
  }
}

export async function fetchNativePrice() {
  try {
    const res  = await fetch(`${LLAMA_COINS}/${PRICE_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.coins?.[PRICE_KEY]?.price ?? null;
  } catch {
    return null;
  }
}
