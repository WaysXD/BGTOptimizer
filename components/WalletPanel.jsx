"use client";
import { useAccount, useConnect, useDisconnect, useBalance, useReadContracts } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";
import { C } from "@/lib/constants";
import { fmt } from "@/lib/utils";

const BGT_ADDRESS = "0x46eFC86F0D7455F135CC9df501673739d513E982";

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
];

const VAULT_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "earned", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
];

export default function WalletPanel({ vaults, beraPrice }) {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: beraBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const { data: bgtData } = useReadContracts({
    contracts: [{
      address: BGT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    }],
    query: { enabled: !!address },
  });

  // Batch-read staked balance + pending BGT for all live vault contracts
  const liveVaults = vaults.filter((v) => !!v.vault);
  const { data: positionData, isLoading: posLoading } = useReadContracts({
    contracts: liveVaults.flatMap((v) => [
      { address: v.vault, abi: VAULT_ABI, functionName: "balanceOf", args: [address] },
      { address: v.vault, abi: VAULT_ABI, functionName: "earned",    args: [address] },
    ]),
    query: { enabled: !!address && liveVaults.length > 0 },
  });

  // Parse positions — only include vaults with a non-zero staked balance
  const positions = liveVaults
    .map((v, i) => {
      const balResult    = positionData?.[i * 2]?.result;
      const earnedResult = positionData?.[i * 2 + 1]?.result;
      if (!balResult || balResult === 0n) return null;
      const staked     = Number(formatUnits(balResult, 18));
      const pendingBgt = earnedResult ? Number(formatUnits(earnedResult, 18)) : 0;
      // Approximate USD value: staked_lp × (total_tvl / total_supply)
      const lpPrice    = v.tvl != null && v.totalSupply > 0 ? v.tvl / v.totalSupply : null;
      const stakedUsd  = lpPrice != null ? staked * lpPrice : null;
      return { ...v, staked, pendingBgt, stakedUsd };
    })
    .filter(Boolean);

  const totalPendingBgt = positions.reduce((s, p) => s + p.pendingBgt, 0);
  const totalStakedUsd  = positions.reduce((s, p) => s + (p.stakedUsd ?? 0), 0);

  const bgtBalance = bgtData?.[0]?.result
    ? Number(formatUnits(bgtData[0].result, 18))
    : null;

  // ── Not connected ─────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem", gap: 8 }}>
        {connectors.map((c) => (
          <button
            key={c.uid}
            className="wallet-btn"
            onClick={() => connect({ connector: c })}
            disabled={isPending}
          >
            {isPending ? "Connecting…" : c.name === "Injected" ? "Connect Wallet" : `Connect ${c.name}`}
          </button>
        ))}
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.25rem 1.4rem", marginBottom: "1.5rem" }}>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: positions.length > 0 ? "1.1rem" : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="blink blink-green" />
          <span style={{ fontFamily: C.mono, fontSize: 13, color: C.text0 }}>
            {address?.slice(0, 6)}…{address?.slice(-4)}
          </span>
          {chain?.id !== 80094 && (
            <span style={{ fontSize: 11, background: C.redDim, color: C.red, padding: "2px 8px", borderRadius: 20 }}>
              Wrong network
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Stat label="BERA" value={beraBalance ? Number(beraBalance.formatted).toFixed(3) : "—"} />
          <Stat label="BGT balance" value={bgtBalance != null ? fmt(bgtBalance, 4) : "—"} color={C.honey} />
          <Stat label="BGT earned" value={fmt(totalPendingBgt, 4)} color={C.green} />
          {totalStakedUsd > 0 && <Stat label="Total staked" value={"$" + fmt(totalStakedUsd)} />}
          <button className="wallet-btn sm" onClick={() => disconnect()}>Disconnect</button>
        </div>
      </div>

      {/* Positions */}
      {posLoading && (
        <div style={{ fontSize: 13, color: C.text2 }}>Loading positions…</div>
      )}

      {!posLoading && positions.length === 0 && (
        <div style={{ fontSize: 13, color: C.text2 }}>No active positions in tracked vaults.</div>
      )}

      {positions.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: C.text2, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Your positions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {positions.map((p) => (
              <div
                key={p.vault}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                  gap: 16, alignItems: "center",
                  background: C.bg2, borderRadius: 10, padding: "10px 14px",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.protocol}</div>
                  <div style={{ fontSize: 11, color: C.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.text2, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Staked</div>
                  <div style={{ fontFamily: C.mono, fontSize: 13 }}>{fmt(p.staked, 4)} LP</div>
                  {p.stakedUsd != null && (
                    <div style={{ fontSize: 11, color: C.text2 }}>${fmt(p.stakedUsd, 0)}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.text2, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Pending BGT</div>
                  <div style={{ fontFamily: C.mono, fontSize: 13, color: C.green }}>{fmt(p.pendingBgt, 4)}</div>
                  {beraPrice && p.pendingBgt > 0 && (
                    <div style={{ fontSize: 11, color: C.text2 }}>${fmt(p.pendingBgt * beraPrice, 2)}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.text2, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>APR</div>
                  <div style={{ fontFamily: C.mono, fontSize: 13, color: p.apr != null ? C.honey : C.text2 }}>
                    {p.apr != null ? fmt(p.apr, 0) + "%" : "—"}
                  </div>
                </div>
                <a
                  href={`https://app.kodiak.finance/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lnk"
                >
                  Manage →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 10, color: C.text2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontFamily: C.mono, fontSize: 14, color: color ?? C.text0 }}>{value}</div>
    </div>
  );
}
