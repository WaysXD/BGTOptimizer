# Berachain Swap Integration (Kyber Aggregator)

## Architecture overview
- `/swap` is a dedicated SPA route in `src/main.jsx`.
- `src/components/swap/SwapCard.jsx` owns local UI state and orchestrates quote/approval/swap steps.
- Kyber API calls are centralized in `src/lib/kyber/client.js` with response sanitization in `src/lib/kyber/normalize.js`.
- Berachain-only constraints are in `src/lib/chains/berachain.js` and `src/lib/tokens/berachainTokens.js`.
- Wallet stack uses `wagmi + viem + RainbowKit` from `src/providers.jsx`.

## Environment variables
- `NEXT_PUBLIC_KYBER_AGGREGATOR_API_BASE_URL` (fallback `VITE_KYBER_AGGREGATOR_API_BASE_URL`): defaults to `https://aggregator-api.kyberswap.com`.
- `NEXT_PUBLIC_KYBER_CLIENT_ID` (fallback `VITE_KYBER_CLIENT_ID`): sent via `x-client-id`.
- `NEXT_PUBLIC_SWAP_FEE_RECIPIENT` + `NEXT_PUBLIC_SWAP_FEE_BPS` (and `VITE_*` fallbacks): optional fee config.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (and `VITE_*` fallback): RainbowKit WalletConnect project id.

## Fee support
- Kyber fee params are injected in `[V1] GET /routes` only when env config is valid.
- Current integration sends:
  - `feeAmount=<bps>`
  - `isInBps=true`
  - `chargeFeeBy=currency_in`
  - `feeReceiver=<configured address>`
- Invalid/missing fee config disables fee injection safely (swaps continue without fee).
- Fee config is shown in swap UI before execution.

## Approval and swap flow
1. Debounced quote fetch with exact-in amount.
2. For ERC-20 input, allowance is checked against Kyber `routerAddress`.
3. If allowance is insufficient, approval CTA is shown first.
4. On swap click, app calls Kyber `[V1] POST /route/build` to get calldata.
5. Transaction is simulated (`publicClient.simulateTransaction`) before send.
6. Transaction is submitted with wagmi, tracked, and rendered in local recent history.

## Known edge cases
- Curated token list is intentionally small; expanding list should follow trusted token validation process.
- Kyber route/build response fields can evolve; normalization currently validates required fields and fails fast on shape mismatch.
- `/swap` routing in this Vite app is path-based and assumes static hosting rewrites to `index.html`.

## Basic test plan
- Connect wallet and verify network warning on non-80094.
- Select token pairs (native/ERC-20 combinations), enter amount, verify quote loads and refreshes.
- Validate insufficient balance and zero amount states block swap.
- Validate approval appears for ERC-20 input and swaps only after approval.
- Confirm tx link and recent history item after send.
- Validate fee env values:
  - valid config => fee visible + route calls include fee params.
  - invalid config => fee disabled, swaps still functional.
