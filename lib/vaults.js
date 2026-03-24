// Server-side vault loading — batched RPC + DeFiLlama LP pricing.
import { batchRpc } from "./rpc.js";
import { fetchPrices, fetchBeraPrice } from "./prices.js";
import { enc, dU, dAddr, dStr } from "./decode.js";
import { FACTORY, WBERA, SPY, SEL, STABLES, PROTO } from "./constants.js";

function guessProt(name = "", symbol = "") {
  const q = (name + symbol).toLowerCase();
  for (const [k, v] of Object.entries(PROTO)) {
    if (q.includes(k)) return v;
  }
  return "Unknown";
}

function guessType(name = "", symbol = "", protocol = "") {
  const q = (name + symbol + protocol).toLowerCase();
  if (q.includes("berps") || q.includes("perp")) return "Perps";
  if (q.includes("ibera") || q.includes("liquid staked") || q.includes("lst")) return "LST";
  if (q.includes("lend") || q.includes("bend") || q.includes("supply") || q.includes("collateral")) return "Lending";
  if (q.includes("smilee") || q.includes("option")) return "Options";
  if (q.includes("rwa") || q.includes("nav")) return "RWA";
  if (q.includes("yeet") || q.includes("meme")) return "Meme";
  if (q.includes("beradrome")) return "ve-AMM";
  if (q.includes("kodiak")) return "CL-AMM";
  return "AMM";
}

export async function loadVaults() {
  // 1. Vault count
  const [lenHex] = await batchRpc([{ to: FACTORY, data: SEL.allVaultsLength }]);
  const count = lenHex ? Number(dU(lenHex)) : 0;
  if (!count) throw new Error("no vaults returned from factory");

  const MAX = Math.min(count, 80);

  // 2. All vault addresses (batched)
  const addrResults = await batchRpc(
    Array.from({ length: MAX }, (_, i) => ({
      to: FACTORY,
      data: SEL.allVaults + enc(i),
    }))
  );
  const vaultAddrs = addrResults.map((r) => (r ? dAddr(r) : null)).filter(Boolean);

  // 3. Vault data: rewardRate, periodFinish, totalSupply, stakingToken (4 calls each)
  const vaultResults = await batchRpc(
    vaultAddrs.flatMap((v) => [
      { to: v, data: SEL.rewardRate },
      { to: v, data: SEL.periodFinish },
      { to: v, data: SEL.totalSupply },
      { to: v, data: SEL.stakingToken },
    ])
  );

  const now = Math.floor(Date.now() / 1000);
  const rawVaults = vaultAddrs
    .map((vault, i) => {
      const b = i * 4;
      try {
        const rewardRate   = vaultResults[b]     ? Number(dU(vaultResults[b]))     / 1e36 : 0;
        const periodFinish = vaultResults[b + 1] ? Number(dU(vaultResults[b + 1]))        : 0;
        const totalSupply  = vaultResults[b + 2] ? Number(dU(vaultResults[b + 2])) / 1e18 : 0;
        const stakingToken = vaultResults[b + 3] ? dAddr(vaultResults[b + 3])             : null;
        return { vault, rewardRate, periodFinish, totalSupply, stakingToken, active: periodFinish > now && rewardRate > 0 };
      } catch { return null; }
    })
    .filter(Boolean);

  // 4. Token metadata (symbol + name) for unique staking tokens
  const uniqueTokens = [...new Set(rawVaults.map((v) => v.stakingToken).filter(Boolean))];
  const tokenResults = await batchRpc(
    uniqueTokens.flatMap((t) => [
      { to: t, data: SEL.symbol },
      { to: t, data: SEL.name },
    ])
  );
  const tokenMeta = Object.fromEntries(
    uniqueTokens.map((t, i) => [
      t,
      {
        symbol: tokenResults[i * 2]     ? dStr(tokenResults[i * 2])     : "LP",
        name:   tokenResults[i * 2 + 1] ? dStr(tokenResults[i * 2 + 1]) : "Unknown",
      },
    ])
  );

  // 5. Price all staking tokens via DeFiLlama (handles LP tokens too)
  const [prices, beraPrice] = await Promise.all([
    fetchPrices(uniqueTokens),
    fetchBeraPrice(),
  ]);
  const bp = beraPrice ?? 4.5;

  // 6. Compute APR + TVL
  const vaults = rawVaults.map((v, idx) => {
    const meta     = tokenMeta[v.stakingToken] ?? { symbol: "LP", name: "Unknown" };
    const protocol = guessProt(meta.name, meta.symbol);
    const type     = guessType(meta.name, meta.symbol, protocol);

    let tokenPrice = prices[v.stakingToken?.toLowerCase()];
    if (tokenPrice == null) {
      if (STABLES.has(v.stakingToken?.toLowerCase()))                          tokenPrice = 1.0;
      else if (v.stakingToken?.toLowerCase() === WBERA.toLowerCase()) tokenPrice = bp;
    }

    const tvl    = tokenPrice != null ? v.totalSupply * tokenPrice : null;
    const bpy    = v.rewardRate * SPY;
    const apr    = tvl && tvl > 100 ? (bpy * bp / tvl) * 100 : null;
    const bgtPerDay = v.rewardRate * 86400;

    return {
      id:           idx + 1,
      vault:        v.vault,
      symbol:       meta.symbol,
      name:         meta.name,
      protocol,
      type,
      apr,
      bgtPerDay,
      tvl,
      totalSupply:  v.totalSupply,
      active:       v.active,
      stakingToken: v.stakingToken,
    };
  });

  return { vaults, beraPrice: bp };
}
