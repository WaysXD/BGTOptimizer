import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { berachain } from "./chains/berachain";

const walletConnectProjectId = import.meta.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "dfda5ea4e566a0b2e34aea47639275ba";

export const wagmiConfig = getDefaultConfig({
  appName: "BGT Yield Optimizer",
  projectId: walletConnectProjectId,
  chains: [berachain],
  ssr: false,
});
