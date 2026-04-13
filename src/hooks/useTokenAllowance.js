import { useReadContract } from "wagmi";

const ERC20_ABI = [{
  name: "allowance",
  type: "function",
  stateMutability: "view",
  inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
  outputs: [{ type: "uint256" }],
}];

export function useTokenAllowance({ token, owner, spender }) {
  const query = useReadContract({
    address: token?.isNative ? undefined : token?.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    query: { enabled: !!owner && !!spender && !!token && !token.isNative },
  });

  return {
    allowance: token?.isNative ? 2n ** 255n : (query.data ?? 0n),
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
