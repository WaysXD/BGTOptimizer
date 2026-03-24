// DeFiLlama price fetching — server-side only.

const LLAMA_COINS = "https://coins.llama.fi/prices/current";

/** Fetch token prices for a list of EVM addresses on Berachain. */
export async function fetchPrices(addresses) {
  if (!addresses.length) return {};
  try {
    const coins = addresses.map((a) => `berachain:${a.toLowerCase()}`).join(",");
    const res = await fetch(`${LLAMA_COINS}/${coins}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const out = {};
    for (const [key, val] of Object.entries(data.coins ?? {})) {
      const addr = key.split(":")[1];
      if (addr && val?.price != null) out[addr] = val.price;
    }
    return out;
  } catch {
    return {};
  }
}

/** Fetch BERA / USD via DeFiLlama (CoinGecko source). */
export async function fetchBeraPrice() {
  try {
    const res = await fetch(
      `${LLAMA_COINS}/coingecko:berachain-bera`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.coins?.["coingecko:berachain-bera"]?.price ?? null;
  } catch {
    return null;
  }
}
