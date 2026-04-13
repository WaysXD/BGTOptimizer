import { useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { C } from "../../lib/constants";
import { BERACHAIN_CHAIN_ID, berachain, isBerachain } from "../../lib/chains/berachain";
import { BERACHAIN_TOKENS } from "../../lib/tokens/berachainTokens";
import { kyberFeeConfig, buildKyberSwapTx } from "../../lib/kyber/client";
import { useBerachainSwapQuote } from "../../hooks/useBerachainSwapQuote";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import { useTokenAllowance } from "../../hooks/useTokenAllowance";
import { useApproveToken } from "../../hooks/useApproveToken";
import { useExecuteKyberSwap } from "../../hooks/useExecuteKyberSwap";
import TokenSelector from "./TokenSelector";

const DEFAULT_SLIPPAGE_BPS = 50;

export default function SwapCard() {
  const { address, chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const onBerachain = isBerachain(chainId);
  const [tokenIn, setTokenIn] = useState(BERACHAIN_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(BERACHAIN_TOKENS[2]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_BPS);
  const [recent, setRecent] = useState([]);
  const [uiError, setUiError] = useState(null);

  const amountInWei = useMemo(() => {
    if (!amountIn) return "";
    try { return parseUnits(amountIn, tokenIn.decimals).toString(); } catch { return ""; }
  }, [amountIn, tokenIn]);

  const balance = useTokenBalance({ token: tokenIn, owner: address });
  const insufficient = amountInWei ? balance.raw < BigInt(amountInWei) : false;

  const quote = useBerachainSwapQuote({ enabled: Boolean(onBerachain && tokenIn && tokenOut && amountInWei), tokenIn, tokenOut, amountInWei, origin: address });
  const allowance = useTokenAllowance({ token: tokenIn, owner: address, spender: quote.quote?.routerAddress });
  const needsApproval = !tokenIn.isNative && amountInWei && allowance.allowance < BigInt(amountInWei);
  const approve = useApproveToken();
  const swap = useExecuteKyberSwap();

  const canSwap = isConnected && onBerachain && quote.quote && !insufficient && Number(slippage) >= 1 && Number(slippage) <= 2000;

  async function handleApprove() {
    setUiError(null);
    try {
      await approve.approve({ token: tokenIn, spender: quote.quote.routerAddress, amount: BigInt(amountInWei) });
      await allowance.refetch();
      await quote.refetch();
    } catch (err) {
      setUiError(err.message || "Approval rejected");
    }
  }

  async function handleSwap() {
    setUiError(null);
    if (!quote.quote) return;
    try {
      const built = await buildKyberSwapTx({ routeSummary: quote.quote.routeSummary, sender: address, recipient: address, slippageBps: Number(slippage) });
      const hash = await swap.execute({ account: address, chain: berachain, to: built.routerAddress, data: built.calldata, value: tokenIn.isNative ? BigInt(amountInWei) : 0n, gas: built.gasLimit });
      setRecent((r) => [{ hash, at: new Date().toISOString() }, ...r].slice(0, 5));
      quote.refetch();
    } catch (err) {
      setUiError(err.message || "Swap failed");
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "2rem auto", background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Berachain Swap</h2>
        <ConnectButton />
      </div>
      {!onBerachain && isConnected && (
        <div style={{ background: C.redDim, color: C.red, padding: 10, borderRadius: 8, marginBottom: 12 }}>
          Wrong network. <button className="pill-btn on" onClick={() => switchChain({ chainId: BERACHAIN_CHAIN_ID })}>Switch to Berachain</button>
        </div>
      )}
      <div style={{ display: "grid", gap: 12 }}>
        <TokenSelector label="From" selected={tokenIn} onSelect={setTokenIn} blockedAddress={tokenOut.address} />
        <TokenSelector label="To" selected={tokenOut} onSelect={setTokenOut} blockedAddress={tokenIn.address} />
        <button className="pill-btn" onClick={() => { const a = tokenIn; setTokenIn(tokenOut); setTokenOut(a); }}>⇅ Reverse</button>

        <div>
          <div style={{ fontSize: 11, color: C.text2, marginBottom: 6 }}>Amount in</div>
          <input aria-label="Amount in" type="text" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} placeholder="0.0" style={{ width: "100%" }} />
          <div style={{ marginTop: 6, fontSize: 12, color: insufficient ? C.red : C.text2 }}>Balance: {formatUnits(balance.raw, tokenIn.decimals)} {tokenIn.symbol}</div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: C.text2, marginBottom: 6 }}>Slippage (bps)</div>
          <input aria-label="Slippage" type="number" min="1" max="2000" value={slippage} onChange={(e) => setSlippage(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, fontSize: 12 }}>
          <div>Est. output: {quote.quote ? `${formatUnits(BigInt(quote.quote.amountOut), tokenOut.decimals)} ${tokenOut.symbol}` : "—"}</div>
          <div>Price impact: {quote.quote ? `${quote.quote.priceImpact}%` : "—"}</div>
          <div>Gas estimate: {quote.quote?.gas || "—"}</div>
          <div>Integrator fee: {kyberFeeConfig.enabled ? `${kyberFeeConfig.bps} bps → ${kyberFeeConfig.recipient.slice(0, 6)}…${kyberFeeConfig.recipient.slice(-4)}` : "Disabled"}</div>
          <div>Route: {quote.quote?.routeText || "—"}</div>
          <div>Last updated: {quote.updatedAt?.toLocaleTimeString() || "—"}</div>
          <button className="pill-btn" onClick={() => quote.refetch()} disabled={quote.isLoading}>Refresh quote</button>
        </div>

        {quote.error && <div style={{ color: C.red, fontSize: 12 }}>Quote error: {quote.error.message}</div>}
        {uiError && <div style={{ color: C.red, fontSize: 12 }}>{uiError}</div>}

        {needsApproval ? (
          <button className="wallet-btn" disabled={!canSwap || approve.isPending} onClick={handleApprove}>{approve.isPending ? "Approving…" : `Approve ${tokenIn.symbol}`}</button>
        ) : (
          <button className="wallet-btn" disabled={!canSwap || swap.isPending} onClick={handleSwap}>{swap.isPending ? "Swapping…" : "Swap"}</button>
        )}

        {swap.txHash && (
          <a className="lnk" href={`${berachain.blockExplorers.default.url}/tx/${swap.txHash}`} target="_blank" rel="noreferrer">View transaction</a>
        )}

        <div>
          <div style={{ fontSize: 11, color: C.text2, marginBottom: 6 }}>Recent swaps</div>
          {recent.length === 0 ? <div style={{ fontSize: 12, color: C.text2 }}>No swaps yet.</div> : recent.map((tx) => (
            <div key={tx.hash} style={{ fontSize: 12 }}><a className="lnk" href={`${berachain.blockExplorers.default.url}/tx/${tx.hash}`} target="_blank" rel="noreferrer">{tx.hash.slice(0, 10)}…</a></div>
          ))}
        </div>
      </div>
    </div>
  );
}
