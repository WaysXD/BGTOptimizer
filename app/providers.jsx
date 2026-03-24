"use client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi"; // also runs createAppKit as a side-effect
import { useState } from "react";

export function Providers({ children }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
