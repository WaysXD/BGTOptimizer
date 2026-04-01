# Vercel Deployment Reality Check

## Short answer
- **Frontend (`apps/web`)**: Yes, deployable to Vercel as a static Vite app.
- **Current realtime server (`apps/server` with Socket.IO + in-memory state)**: **No**, not production-viable on Vercel serverless because MMO realtime sockets need long-lived stateful processes.

## Recommended production split
1. Deploy `apps/web` to Vercel.
2. Deploy `apps/server` to a stateful runtime (Fly.io, Railway, Render, Kubernetes, or ECS).
3. Run PostgreSQL + Redis as managed services.
4. Set web env var `VITE_GAME_SERVER_URL` to the external server URL.

## Why not full Vercel-only right now?
- Vercel functions are stateless/ephemeral and not ideal for authoritative multiplayer loops.
- Socket fanout and entity simulation require stable process memory and persistent connections.

## If you still want max Vercel usage
- Keep auth/API edge helpers on Vercel.
- Move realtime to managed WebSocket infra or dedicated game server nodes.
- Use Redis pub/sub for multi-node room sync in phase 2.
