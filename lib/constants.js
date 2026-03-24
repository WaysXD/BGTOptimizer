export const FACTORY = "0x94Ad6Ac84f6C6FbA8b8CCbD71d9f4f101def52a8";
export const WBERA   = "0x6969696969696969696969696969696969696969";
export const HONEY   = "0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce";
export const BGT     = "0x46eFC86F0D7455F135CC9df501673739d513E982";
export const RPC     = "https://rpc.berachain.com";
export const SPY     = 31_536_000; // seconds per year

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
  HONEY.toLowerCase(),
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // bridged USDC
]);

// Protocol keyword → display name
export const PROTO = {
  honey: "Bend", bex: "BEX", berps: "Berps", ibera: "Infrared",
  ibgt: "Infrared", smilee: "Smilee", kodiak: "Kodiak",
  beradrome: "Beradrome", nav: "NAV", yeet: "Yeet", re7: "Re7",
};

// Protocol → staking URL (Berahub replaced by protocol-native sites)
export const PROTO_URL = {
  "BEX":       "https://bex.berachain.com/",
  "Infrared":  "https://infrared.finance/vaults",
  "Berps":     "https://berps.berachain.com/",
  "Bend":      "https://bend.berachain.com/",
  "Kodiak":    "https://app.kodiak.finance/",
  "Beradrome": "https://www.beradrome.com/",
  "Smilee":    "https://smilee.finance/",
  "NAV":       "https://app.nav.xyz/",
  "Yeet":      "https://app.yeet.xyz/",
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
  mono: "var(--font-mono),'Fira Code','Courier New',monospace",
  sans: "var(--font-inter),system-ui,sans-serif",
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
  { id:1, vault:null, protocol:"BEX",       name:"HONEY / WBERA",    symbol:"BEX-LP",  apr:2847, bgtPerDay:0.89, tvl:18400000, totalSupply:null, type:"AMM",     active:true, stakingToken:null },
  { id:2, vault:null, protocol:"BEX",       name:"BERA / USDC.e",    symbol:"BEX-LP",  apr:1203, bgtPerDay:0.51, tvl:11200000, totalSupply:null, type:"AMM",     active:true, stakingToken:null },
  { id:3, vault:null, protocol:"BEX",       name:"WETH / HONEY",     symbol:"BEX-LP",  apr:724,  bgtPerDay:0.38, tvl:8600000,  totalSupply:null, type:"AMM",     active:true, stakingToken:null },
  { id:4, vault:null, protocol:"Infrared",  name:"iBERA Vault",      symbol:"iBERA",   apr:431,  bgtPerDay:0.22, tvl:42000000, totalSupply:null, type:"LST",     active:true, stakingToken:null },
  { id:5, vault:null, protocol:"Kodiak",    name:"BERA / HONEY",     symbol:"KDK-LP",  apr:298,  bgtPerDay:0.15, tvl:7100000,  totalSupply:null, type:"CL-AMM",  active:true, stakingToken:null },
  { id:6, vault:null, protocol:"Berps",     name:"HONEY Vault",      symbol:"bHONEY",  apr:187,  bgtPerDay:0.09, tvl:24000000, totalSupply:null, type:"Perps",   active:true, stakingToken:null },
  { id:7, vault:null, protocol:"Bend",      name:"Re7 HONEY Lend",   symbol:"aHONEY",  apr:42,   bgtPerDay:0.02, tvl:31000000, totalSupply:null, type:"Lending", active:true, stakingToken:null },
];
