import { useCallback, useEffect, useRef, useState } from "react";
import { getKyberRoute } from "../lib/kyber/client";

export function useBerachainSwapQuote({ enabled, tokenIn, tokenOut, amountInWei, origin }) {
  const [state, setState] = useState({ isLoading: false, quote: null, error: null, updatedAt: null });
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const fetchQuote = useCallback(async () => {
    if (!enabled || !tokenIn || !tokenOut || !amountInWei) {
      abortRef.current?.abort();
      setState((s) => ({ ...s, quote: null, error: null, isLoading: false }));
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const current = ++requestIdRef.current;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const quote = await getKyberRoute({
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: amountInWei,
        origin,
      }, controller.signal);

      if (current !== requestIdRef.current) return;
      setState({ isLoading: false, quote, error: null, updatedAt: new Date() });
    } catch (error) {
      if (controller.signal.aborted || current !== requestIdRef.current) return;
      setState({ isLoading: false, quote: null, error, updatedAt: null });
    }
  }, [enabled, tokenIn, tokenOut, amountInWei, origin]);

  useEffect(() => {
    const id = setTimeout(fetchQuote, 450);
    return () => {
      clearTimeout(id);
      abortRef.current?.abort();
    };
  }, [fetchQuote]);

  return {
    ...state,
    refetch: fetchQuote,
    clear: () => setState({ isLoading: false, quote: null, error: null, updatedAt: null }),
  };
}
