const COINGECKO_BERA_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=berachain-bera&vs_currencies=usd";
const BERASCAN_GAS_TRACKER_URL = "https://berascan.com/gastracker";

const FALLBACK_BERA_USD = 0.2;
const FALLBACK_GAS_USD = 0.02;
const ONE_GWEI_WEI = 1_000_000_000n;

let priceCache = { at: 0, value: FALLBACK_BERA_USD };
let gasCache = { at: 0, wei: 200_000n }; // 0.0002 gwei default

async function getBeraUsdPrice() {
  const now = Date.now();
  if (now - priceCache.at < 60_000 && priceCache.value > 0) return priceCache.value;
  const response = await fetch(COINGECKO_BERA_PRICE_URL);
  const data = await response.json();
  const price = Number(data?.["berachain-bera"]?.usd ?? 0);
  if (price > 0) {
    priceCache = { at: now, value: price };
    return price;
  }
  return priceCache.value;
}

async function getRpcGasPriceWei() {
  const response = await fetch("/api/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
  });
  const json = await response.json();
  if (!response.ok || !json?.result) throw new Error("Could not fetch gas price");
  return BigInt(json.result);
}

async function getBerascanGasPriceWei() {
  const response = await fetch(BERASCAN_GAS_TRACKER_URL);
  if (!response.ok) throw new Error("Could not fetch Berascan gas tracker");
  const html = await response.text();
  const titleMatch = html.match(/<title>\s*([\d.]+)\s*Gwei/i);
  const gwei = Number(titleMatch?.[1] ?? "0");
  if (!Number.isFinite(gwei) || gwei < 0) throw new Error("Invalid Berascan gas tracker value");
  return BigInt(Math.round(gwei * 1e9));
}

async function getGasPriceWei() {
  const now = Date.now();
  if (now - gasCache.at < 15_000) return gasCache.wei;

  try {
    const [rpcWei, berascanWei] = await Promise.allSettled([getRpcGasPriceWei(), getBerascanGasPriceWei()]);
    const rpc = rpcWei.status === "fulfilled" ? rpcWei.value : null;
    const berascan = berascanWei.status === "fulfilled" ? berascanWei.value : null;

    const selected = berascan != null && berascan > 0n
      ? (rpc != null && rpc > 0n ? (rpc < berascan ? rpc : berascan) : berascan)
      : (rpc ?? gasCache.wei);

    gasCache = { at: now, wei: selected > 0n ? selected : gasCache.wei };
    return gasCache.wei;
  } catch {
    return gasCache.wei;
  }
}

export async function estimateGasCostUsd({ gasUnits = 220_000n }) {
  try {
    const [gasPriceWei, beraUsd] = await Promise.all([getGasPriceWei(), getBeraUsdPrice()]);
    // Protect against stale RPC floors by clamping to <= 1 gwei for Berachain's low-fee environment.
    const effectiveGasPriceWei = gasPriceWei > ONE_GWEI_WEI ? ONE_GWEI_WEI : gasPriceWei;
    const gasBera = Number(effectiveGasPriceWei * gasUnits) / 1e18;
    return gasBera * beraUsd;
  } catch {
    return FALLBACK_GAS_USD;
  }
}
