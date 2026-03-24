import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono  = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"], display: "swap" });

export const metadata = {
  title: "BGT Yield Optimizer — Berachain",
  description: "Live BGT reward vault rankings and APR calculator for Berachain Proof-of-Liquidity.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", background: "#08090c" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
