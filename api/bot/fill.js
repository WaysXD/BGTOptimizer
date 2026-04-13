const { createWalletClient, createPublicClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");

const berachain = {
  id: 80094,
  name: "Berachain",
  nativeCurrency: { name: "BERA", symbol: "BERA", decimals: 18 },
  rpcUrls: { default: { http: [process.env.BERACHAIN_RPC_URL || "https://rpc.berachain.com"] } },
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if ((process.env.BOT_MODE || "dry-run") !== "live") {
    return res.status(400).json({ error: "Live execution disabled. Set BOT_MODE=live server-side." });
  }

  try {
    const key = process.env.BOT_PRIVATE_KEY;
    if (!key) throw new Error("BOT_PRIVATE_KEY is required server-side");

    const account = privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`);
    const publicClient = createPublicClient({ chain: berachain, transport: http(berachain.rpcUrls.default.http[0]) });
    const walletClient = createWalletClient({ account, chain: berachain, transport: http(berachain.rpcUrls.default.http[0]) });

    const tx = req.body || {};
    await publicClient.simulateTransaction({
      account,
      to: tx.to,
      data: tx.data,
      value: BigInt(tx.value || "0"),
    });

    const fees = await publicClient.estimateFeesPerGas();

    const hash = await walletClient.sendTransaction({
      account,
      to: tx.to,
      data: tx.data,
      value: BigInt(tx.value || "0"),
      gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
    });

    return res.status(200).json({ hash });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
