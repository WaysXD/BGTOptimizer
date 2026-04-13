import { useBalance, useReadContract } from "wagmi";

const ERC20_ABI = [{
  name: "balanceOf",
  type: "function",
  stateMutability: "view",
  inputs: [{ name: "account", type: "address" }],
  outputs: [{ type: "uint256" }],
}];

export function useTokenBalance({ token, owner }) {
  const native = useBalance({ address: owner, query: { enabled: !!owner && token?.isNative } });
  const erc20 = useReadContract({
    address: token?.isNative ? undefined : token?.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner && !!token && !token.isNative },
  });

  if (token?.isNative) {
    return { raw: native.data?.value ?? 0n, decimals: token.decimals, isLoading: native.isLoading };
  }
  return { raw: erc20.data ?? 0n, decimals: token?.decimals ?? 18, isLoading: erc20.isLoading };
}
