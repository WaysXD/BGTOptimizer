const env = import.meta.env;

export const CHAIN_NAME        = env.VITE_CHAIN_NAME ?? "RiseChain";
export const CHAIN_ID          = Number(env.VITE_CHAIN_ID ?? 11155931);
export const CHAIN_CAIP        = env.VITE_CHAIN_CAIP ?? `eip155:${CHAIN_ID}`;
export const RPC               = env.VITE_RPC_URL ?? "https://rpc.risechain.com";
export const EXPLORER_NAME     = env.VITE_EXPLORER_NAME ?? "RiseScan";
export const EXPLORER_URL      = env.VITE_EXPLORER_URL ?? "https://scan.risechain.com";
export const NATIVE_SYMBOL     = env.VITE_NATIVE_SYMBOL ?? "RISE";
export const REWARD_SYMBOL     = env.VITE_REWARD_SYMBOL ?? "RISE";
export const APP_NAME          = env.VITE_APP_NAME ?? "Rise Yield Optimizer";
export const APP_URL           = env.VITE_APP_URL ?? "https://riseoptimizer.vercel.app";
export const REWARD_TOKEN_ADDR = env.VITE_REWARD_TOKEN ?? "0x0000000000000000000000000000000000000000";
export const WRAPPED_NATIVE    = env.VITE_WRAPPED_NATIVE ?? "0x0000000000000000000000000000000000000000";
export const FACTORY           = env.VITE_FACTORY ?? "0x0000000000000000000000000000000000000000";
export const PRICE_NAMESPACE   = env.VITE_PRICE_NAMESPACE ?? "risechain";
export const PRICE_KEY         = env.VITE_PRICE_KEY ?? "coingecko:ethereum";

export const SPY = 31_536_000; // seconds per year

export const SEL = {
  allVaultsLength: "0x36deba41",
  allVaults:       "0xf01aa5e7",
  rewardRate:      "0x7b0a47ee",
  periodFinish:    "0xebe2b12b",
  totalSupply:     "0x18160ddd",
  stakingToken:    "0x72f702f3",
  symbol:          "0x95d89b41",
  name:            "0x06fdde03",
};

// Stablecoins — price = $1
export const STABLES = new Set([
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "0xdac17f958d2ee523a2206206994597c13d831ec7",
]);

// Protocol keyword → display name
export const PROTO = {
  rise: "Rise", ambient: "Ambient", curve: "Curve", aave: "Aave",
  uni: "Uniswap", pendle: "Pendle", vault: "Vault",
};

// Protocol → staking URL
export const PROTO_URL = {
  "Rise":    "https://app.risechain.com/",
  "Ambient": "https://app.ambient.finance/",
  "Curve":   "https://curve.fi/",
  "Aave":    "https://app.aave.com/",
  "Uniswap": "https://app.uniswap.org/",
  "Pendle":  "https://app.pendle.finance/",
  "Vault":   "https://app.risechain.com/",
};

export const C = {
  bg0: "#08090c", bg1: "#0f1117", bg2: "#151820", bg3: "#1c2030",
  border: "#22283a", border2: "#2c3450",
  text0: "#eceae5", text1: "#9198a8", text2: "#515869",
  honey: "#f5a623", honeyDim: "#2e1f08", honeyGlow: "#f5a62344",
  green: "#38d98a", greenDim: "#0a2018",
  red: "#f06060",   redDim: "#2a0d0d",
  blue: "#5aade8",  blueDim: "#0c1a2a",
  purple: "#b07cf8", purpleDim: "#1a0d30",
  mono: "'JetBrains Mono','Fira Code','Courier New',monospace",
  sans: "Inter,system-ui,sans-serif",
};

export const TYPE_PILL = {
  "AMM":     { bg: "#0c1a2a", c: "#5aade8" },
  "CL-AMM":  { bg: "#0c1a2a", c: "#5aade8" },
  "ve-AMM":  { bg: "#0c1a2a", c: "#5aade8" },
  "LST":     { bg: "#0a2018", c: "#38d98a" },
  "Perps":   { bg: "#2a0d0d", c: "#f06060" },
  "Lending": { bg: "#2e1f08", c: "#f5a623" },
  "Options": { bg: "#1a0d30", c: "#b07cf8" },
  "RWA":     { bg: "#1c2030", c: "#9198a8" },
  "Meme":    { bg: "#2a0d0d", c: "#f06060" },
};

export const MOCK = [
  { id:1, vault:null, protocol:"Rise",    name:"RISE / USDC",    symbol:"RS-LP", apr:312, bgtPerDay:1.14, tvl:8600000, totalSupply:null, type:"AMM",     active:true, stakingToken:null },
  { id:2, vault:null, protocol:"Ambient", name:"RISE / WETH",    symbol:"AMB",   apr:204, bgtPerDay:0.88, tvl:5300000, totalSupply:null, type:"CL-AMM",  active:true, stakingToken:null },
  { id:3, vault:null, protocol:"Pendle",  name:"stRISE Vault",   symbol:"stRISE",apr:141, bgtPerDay:0.47, tvl:11200000,totalSupply:null, type:"LST",     active:true, stakingToken:null },
  { id:4, vault:null, protocol:"Curve",   name:"USDC / USDT",    symbol:"crvLP", apr:56,  bgtPerDay:0.19, tvl:17400000,totalSupply:null, type:"AMM",     active:true, stakingToken:null },
  { id:5, vault:null, protocol:"Aave",    name:"USDC Lending",   symbol:"aUSDC", apr:18,  bgtPerDay:0.05, tvl:22900000,totalSupply:null, type:"Lending", active:true, stakingToken:null },
];
