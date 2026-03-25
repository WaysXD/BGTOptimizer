// Client-side DeFiLlama price fetching.
const LLAMA_COINS = "https://coins.llama.fi/prices/current";

export async function fetchPrices(addresses) {
  if (!addresses.length) return {};
  try {
    const coins = addresses.map((a) => `berachain:${a.toLowerCase()}`).join(",");
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

export async function fetchBeraPrice() {
  try {
    const res  = await fetch(`${LLAMA_COINS}/coingecko:berachain-bera`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.coins?.["coingecko:berachain-bera"]?.price ?? null;
  } catch {
    return null;
  }
}
