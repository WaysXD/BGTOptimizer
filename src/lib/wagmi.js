import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const projectId = "dfda5ea4e566a0b2e34aea47639275ba";

export const berachain = {
  id: 80094,
  caipNetworkId: "eip155:80094",
  chainNamespace: "eip155",
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

const networks = [berachain];

export const wagmiAdapter = new WagmiAdapter({ networks, projectId });

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: berachain,
  projectId,
  metadata: {
    name: "BGT Yield Optimizer",
    description: "Live BGT reward vault rankings for Berachain Proof-of-Liquidity",
    url: "https://bgtoptimizer.vercel.app",
    icons: ["/favicon.svg"],
  },
  features: {
    analytics: false,
    email:     false,
    socials:   false,
    onramp:    false,
    swaps:     false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent":               "#f5a623",
    "--w3m-border-radius-master": "4px",
    "--w3m-font-family":          "Inter, system-ui, sans-serif",
    "--w3m-color-bg-100":         "#0f1117",
    "--w3m-color-bg-125":         "#151820",
    "--w3m-color-bg-150":         "#1c2030",
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
