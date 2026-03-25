import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  APP_NAME,
  APP_URL,
  CHAIN_CAIP,
  CHAIN_ID,
  CHAIN_NAME,
  EXPLORER_NAME,
  EXPLORER_URL,
  NATIVE_SYMBOL,
  RPC,
} from "./constants";

const projectId = "dfda5ea4e566a0b2e34aea47639275ba";

export const targetChain = {
  id: CHAIN_ID,
  caipNetworkId: CHAIN_CAIP,
  chainNamespace: "eip155",
  name: CHAIN_NAME,
  nativeCurrency: { name: NATIVE_SYMBOL, symbol: NATIVE_SYMBOL, decimals: 18 },
  rpcUrls: {
    default: { http: [RPC] },
    public:  { http: [RPC] },
  },
  blockExplorers: {
    default: { name: EXPLORER_NAME, url: EXPLORER_URL },
  },
};

const networks = [targetChain];

export const wagmiAdapter = new WagmiAdapter({ networks, projectId });

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: targetChain,
  projectId,
  metadata: {
    name: APP_NAME,
    description: `Live reward vault rankings for ${CHAIN_NAME}`,
    url: APP_URL,
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
