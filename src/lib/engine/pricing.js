import { BGT, HONEY, WBERA } from "../constants";

const CACHE_MS = 45_000;
let cached = { at: 0, prices: {} };

const TOKEN_IDS = {
  [WBERA.toLowerCase()]: "berachain-bera",
};

async function fetchCoingeckoSimple(ids) {
  if (!ids.length) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function fetchTokenPriceByAddress(addresses) {
  if (!addresses.length) return {};
  const url = `https://api.coingecko.com/api/v3/simple/token_price/berachain?contract_addresses=${addresses.join(",")}&vs_currencies=usd`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

export async function getTokenPricesUsd(addresses) {
  const now = Date.now();
  if (now - cached.at < CACHE_MS) {
    return addresses.reduce((acc, a) => ({ ...acc, [a.toLowerCase()]: cached.prices[a.toLowerCase()] ?? 0 }), {});
  }

  const normalized = [...new Set(addresses.map((a) => a.toLowerCase()))];
  const idBacked = normalized.filter((a) => TOKEN_IDS[a]);
  const addrBacked = normalized.filter((a) => !TOKEN_IDS[a]);

  const [idsJson, addrJson] = await Promise.all([
    fetchCoingeckoSimple(idBacked.map((a) => TOKEN_IDS[a])),
    fetchTokenPriceByAddress(addrBacked),
  ]);

  const prices = {};
  for (const addr of idBacked) prices[addr] = Number(idsJson?.[TOKEN_IDS[addr]]?.usd ?? 0);
  for (const addr of addrBacked) prices[addr] = Number(addrJson?.[addr]?.usd ?? 0);

  // Fallback peg assumption for HONEY only when feed unavailable.
  if (!prices[HONEY.toLowerCase()]) prices[HONEY.toLowerCase()] = 1;
  if (!prices[BGT.toLowerCase()]) prices[BGT.toLowerCase()] = 0;

  cached = { at: now, prices };
  return prices;
}
