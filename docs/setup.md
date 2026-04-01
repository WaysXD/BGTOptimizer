# Local Setup

1. Install deps:
   - `npm install --workspaces`
2. Run server:
   - `npm run dev:server`
3. Run web client:
   - `npm run dev:web`
4. Open browser at Vite URL (usually `http://localhost:5173`).

## Env vars
- `DATABASE_URL` (PostgreSQL)
- `REDIS_URL`
- `JWT_SECRET`
- `BERA_RPC_URL`
- `BERA_CHAIN_ID`
- `CLAIM_SIGNER_PRIVATE_KEY`
- `TOKEN_ADDRESS`
- `REWARD_DISTRIBUTOR_ADDRESS`

## Seed content
- `npm run seed`
