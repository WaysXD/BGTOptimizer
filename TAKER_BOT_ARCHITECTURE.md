# TAKER_BOT_ARCHITECTURE

## Product scope
Single-purpose Berachain (80094) Kyber Limit Order taker dashboard.

## Core modules
- `src/lib/kyber/takerClient.js`: Kyber LO API client.
- `src/lib/config/env.js`: env parsing + live-mode validation.
- `src/lib/config/pairs.js`: centralized pair thresholds/risk limits.
- `src/lib/engine/poller.js`: per-pair order polling.
- `src/lib/engine/profitability.js`: bigint-safe opportunity scoring.
- `src/lib/engine/risk.js`: hard safety rails.
- `src/lib/engine/executor.js`: dry-run/live execution orchestration.
- `src/lib/engine/hedger.js`: hedge abstraction entry point.
- `src/lib/engine/persistence.js`: local dashboard persistence.

## Execution flow
1. Poll orders from `/read-partner/api/v1/orders`.
2. Score each order (edge/profit/gas checks).
3. Apply risk limits.
4. If eligible, request operator signature.
5. Request encoded fill calldata.
6. Dry-run: record hypothetical fill.
7. Live mode: send tx via server endpoint `/api/bot/fill`.
8. Optionally call hedge module.

## Security model
- No private key in browser.
- Live execution requires server env `BOT_PRIVATE_KEY` and `BOT_MODE=live`.
- Client mode defaults to dry-run.
