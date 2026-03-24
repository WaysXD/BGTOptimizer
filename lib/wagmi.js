"use client";
import { createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";

const berachain = {
  id: 80094,
  name: "Berachain",
  nativeCurrency: { name: "BERA", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.berachain.com"] },
    public:  { http: ["https://rpc.berachain.com"] },
  },
  blockExplorers: {
    default: { name: "Berascan", url: "https://berascan.com" },
  },
};

const connectors = [
  injected({ shimDisconnect: true }),
  ...(process.env.NEXT_PUBLIC_WC_PROJECT_ID
    ? [walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID })]
    : []
  ),
];

export const wagmiConfig = createConfig({
  chains: [berachain],
  connectors,
  transports: { [berachain.id]: http() },
  ssr: true,
});

export { berachain };
