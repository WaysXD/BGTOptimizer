import { defineChain } from "viem";

export const BERACHAIN_CHAIN_ID = 80094;
export const BERACHAIN_CHAIN_SLUG = "berachain";
export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const berachain = defineChain({
  id: BERACHAIN_CHAIN_ID,
  name: "Berachain",
  nativeCurrency: { name: "BERA", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.berachain.com"] },
    public: { http: ["https://rpc.berachain.com"] },
  },
  blockExplorers: {
    default: { name: "Berascan", url: "https://berascan.com" },
  },
});

export function isBerachain(chainId) {
  return Number(chainId) === BERACHAIN_CHAIN_ID;
}
