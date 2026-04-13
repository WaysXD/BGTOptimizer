import { BGT, HONEY, WBERA } from "../constants";
import { NATIVE_TOKEN_ADDRESS } from "../chains/berachain";

export const BERACHAIN_TOKENS = [
  {
    symbol: "BERA",
    name: "Berachain",
    address: NATIVE_TOKEN_ADDRESS,
    decimals: 18,
    isNative: true,
    logoURI: "https://assets.coingecko.com/coins/images/38098/standard/BERA.png",
  },
  {
    symbol: "WBERA",
    name: "Wrapped BERA",
    address: WBERA,
    decimals: 18,
    isNative: false,
    logoURI: "https://assets.coingecko.com/coins/images/38098/standard/BERA.png",
  },
  {
    symbol: "HONEY",
    name: "Honey",
    address: HONEY,
    decimals: 18,
    isNative: false,
    logoURI: "https://assets.coingecko.com/coins/images/39838/standard/honey_3d.png",
  },
  {
    symbol: "BGT",
    name: "Bera Governance Token",
    address: BGT,
    decimals: 18,
    isNative: false,
    logoURI: "https://assets.coingecko.com/coins/images/39199/standard/BGT.png",
  },
].map((token) => ({ ...token, address: token.address.toLowerCase() }));

export function findTokenByAddress(address) {
  if (!address) return null;
  return BERACHAIN_TOKENS.find((t) => t.address === address.toLowerCase()) ?? null;
}
