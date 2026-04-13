import { useState } from "react";
import { usePublicClient, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

export function useExecuteKyberSwap() {
  const [error, setError] = useState(null);
  const publicClient = usePublicClient();
  const send = useSendTransaction();
  const wait = useWaitForTransactionReceipt({ hash: send.data });

  async function execute(txRequest) {
    setError(null);
    try {
      await publicClient.simulateTransaction(txRequest);
      return await send.sendTransactionAsync(txRequest);
    } catch (err) {
      setError(err);
      throw err;
    }
  }

  return {
    execute,
    txHash: send.data,
    isPending: send.isPending || wait.isLoading,
    isConfirmed: wait.isSuccess,
    error: error || send.error || wait.error,
  };
}
