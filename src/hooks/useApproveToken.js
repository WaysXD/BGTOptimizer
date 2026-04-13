import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const ERC20_ABI = [{
  name: "approve",
  type: "function",
  stateMutability: "nonpayable",
  inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
  outputs: [{ type: "bool" }],
}];

export function useApproveToken() {
  const write = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: write.data });

  function approve({ token, spender, amount }) {
    if (!token || token.isNative) throw new Error("Approval is only needed for ERC-20");
    return write.writeContractAsync({
      address: token.address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  }

  return { approve, isPending: write.isPending || wait.isLoading, isConfirmed: wait.isSuccess, txHash: write.data, error: write.error || wait.error };
}
