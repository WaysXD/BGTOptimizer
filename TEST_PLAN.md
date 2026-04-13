# TEST_PLAN

1. Start in dry-run mode and verify heartbeat updates.
2. Confirm opportunities/rejections populate for enabled pairs.
3. Validate rejection reasons for edge/profit/gas checks.
4. Trigger Global Pause and verify no fills are attempted.
5. Trigger Emergency Stop and verify polling halts.
6. Enable live mode without BOT_PRIVATE_KEY and confirm validation warning.
7. Enable live mode with BOT_PRIVATE_KEY in server env and verify `/api/bot/fill` transaction submission.
8. Verify fill rows include status, tx hash, and hedge status.

9. Verify realized/unrealized PnL cards update after fill events.
10. Verify hedge leg executes (live) or reports simulated route output (dry-run).
