# RUNBOOK

## Start dashboard
1. `npm install`
2. Configure `.env`
3. `npm run dev`

## Dry-run mode
- Set `BOT_MODE=dry-run` (default).
- Engine scans and records opportunities/rejections/fills without sending tx.

## Live mode
- Set server env `BOT_MODE=live` and `BOT_PRIVATE_KEY`.
- Ensure wallet has gas token and approved taker assets where required.
- Verify pair thresholds before enabling `Start`.

## Emergency controls
- Use **Global Pause** to stop execution decisions.
- Use **Emergency Stop** to halt engine immediately.

## Incident checks
- Review Logs/Diagnostics panel.
- Verify last heartbeat timestamp.
- Confirm Kyber API availability and RPC latency.
