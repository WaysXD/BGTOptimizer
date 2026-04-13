# ENVIRONMENT

## Required
- `BERACHAIN_RPC_URL` (default: `https://rpc.berachain.com`)
- `KYBER_LIMIT_ORDER_API_BASE_URL` (default: `https://limit-order.kyberswap.com`)
- `KYBER_CLIENT_ID` (default: `BerachainTakerDashboard`)
- `BOT_MODE` (`dry-run` or `live`)

## Live-only required (server-side only)
- `BOT_PRIVATE_KEY`

## Optional
- `KYBER_AGGREGATOR_API_BASE_URL`
- `DEFAULT_MIN_EDGE_BPS`
- `DEFAULT_MAX_GAS_USD` (default `0.10`, tuned for Berachain's very low gas regime)
- `DEFAULT_MIN_PROFIT_USD`
- `HEDGE_ENABLED`
