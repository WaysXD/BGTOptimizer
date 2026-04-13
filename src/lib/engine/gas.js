const COINGECKO_BERA_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=berachain-bera&vs_currencies=usd";

let cached = { at: 0, value: 0.2 };

async function getBeraUsdPrice() {
  const now = Date.now();
  if (now - cached.at < 60_000 && cached.value > 0) return cached.value;
  const response = await fetch(COINGECKO_BERA_PRICE_URL);
  const data = await response.json();
  const price = Number(data?.["berachain-bera"]?.usd ?? 0);
  if (price > 0) {
    cached = { at: now, value: price };
    return price;
  }
  return cached.value;
}

async function getGasPriceWei() {
  const response = await fetch("/api/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
  });
  const json = await response.json();
  if (!response.ok || !json?.result) throw new Error("Could not fetch gas price");
  return BigInt(json.result);
}

export async function estimateGasCostUsd({ gasUnits = 220_000n }) {
  try {
    const [gasPriceWei, beraUsd] = await Promise.all([getGasPriceWei(), getBeraUsdPrice()]);
    const gasBera = Number((gasPriceWei * gasUnits)) / 1e18;
    return gasBera * beraUsd;
  } catch {
    return 0.2;
  }
}
