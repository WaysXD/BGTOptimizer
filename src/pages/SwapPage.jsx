import SwapCard from "../components/swap/SwapCard";
import { C } from "../lib/constants";

export default function SwapPage() {
  return (
    <main style={{ background: C.bg0, minHeight: "100vh", color: C.text0, padding: "1.25rem" }}>
      <SwapCard />
    </main>
  );
}
