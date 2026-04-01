# Aetherfall Realms - Game Design & Technical Blueprint

## Original IP Pillars
Aetherfall Realms is an original fantasy MMO set in the Shardwild Continent, a land fractured by sky-falling aether crystals. Players begin in **Hearthmere Crossing** and rise through crafting guilds, frontier combat, expedition dungeons, and shard-forged economy systems.

## A) High-level architecture
- **apps/web (React + Canvas MVP, Phaser-ready):** UI shells (inventory, quest log, chat, wallet/reward claim panel) + top-down viewport.
- **apps/server (Node + Socket.IO):** Authoritative simulation loop for movement, combat outcomes, drops, skill XP, quest progress, trade validation.
- **PostgreSQL:** persistence for accounts, characters, economy ledgers, auctions, telemetry.
- **Redis:** session cache, anti-spam and anti-bot counters, queue buffering.
- **Event pipeline:** server emits economy/security events to a queue for moderation and analytics.
- **contracts/**: Berachain-compatible Solidity token + claim distributor + treasury sink accounting.
- **Indexer worker (Phase 2):** consumes onchain claim/mint events and reconciles game balances.

## B) Economy model (earn crypto like gold without trivial exploits)
### Hybrid currency layers
1. **Crowns (offchain soft currency):** minute-to-minute gameplay currency for shops, crafting, repair, travel.
2. **EMBER token (onchain):** premium claimable reward token on Berachain. Never minted directly by client action.
3. **Aether Shards (offchain reward points):** earned by eligible activities; converted to claimable EMBER only after anti-abuse checks.

### Anti-exploit guardrails
- Server-authoritative reward issuance only.
- Withdrawals gated by: account age >= 7 days, main quest chapter completion, total level floor, and behavior risk score threshold.
- Dynamic daily cap: min(baseCap, riskAdjustedCap, treasuryBudgetCap).
- Diminishing returns on repetitive low-risk loops by zone tier + repetition index.
- Cooldowns and nonce-based signed claims.
- Separated balances: `play_balance`, `pending_claimable`, `onchain_claimed`.

### Emissions (MVP proposal)
- Total supply: 1,000,000,000 EMBER.
- Reward pool: 35% vested to RewardDistributor.
- Initial live emissions: 0.03% of reward pool/day with admin-governed reduction schedule.
- Per-account max claim/day starts low (e.g., 25 EMBER equivalent), scaled by progression tier.

### Fun vs security tradeoff
- Early game rewards are mostly offchain to keep progression satisfying while limiting extractive farming.
- Onchain claims unlock after meaningful progression; this slightly delays monetizable rewards but dramatically reduces bot ROI.

## C) MVP feature list
- 1 starter town: Hearthmere Crossing.
- 3 zones: Briarthorn Field, Grayfen Trail, Ashen Verge.
- 1 dungeon: Hollowglass Depths.
- 1 boss: The Cinder Matriarch.
- 8 enemy types.
- 6 skills: Bladecraft, Marks, Arcanum, Mining, Timbering, Culinery.
- Realtime multiplayer movement + chat.
- Server-authoritative combat/drops/XP scaffolding.
- Inventory/equipment/bank schema and starter UI.
- Quest framework + 10 designed starter quests (3 implemented in seed content).
- Auction house service/API design with fees/taxes.
- Wallet connect + signed claim prototype.
- Admin telemetry endpoints (economy + suspicious activity feed).

## D) Monorepo structure
```txt
apps/
  web/                 # React client, game viewport, MMO UI panels
  server/              # Authoritative game server + REST/Socket APIs
packages/
  shared/              # Shared types, balance formulas, constants
  db/                  # Prisma schema + migrations + seed helpers
  content/             # World data, NPCs, quests, drops, starter seed
  config/              # Env schema and runtime config loaders
contracts/
  src/                 # Solidity contracts
scripts/               # Dev orchestration, seeding, content checks
docs/
  game-design.md       # Product + architecture + roadmaps
  setup.md             # Local run/deployment steps
```

## E) Smart contract plan (Berachain)
- `EmberToken.sol` (ERC20, AccessControl, Pausable, mint role limited to distributor/treasury).
- `RewardDistributor.sol`
  - EIP-712 server-signed claims.
  - Nonce + claimId replay protection.
  - per-user cooldown and daily cap checks.
  - pause switch and emergency withdraw role.
- `MarketTreasury.sol`
  - receives protocol fees from optional onchain settlement.
  - routes percentages to reward pool, ops wallet, and burn sink.

Architecture choice: **non-upgradeable contracts** for MVP to minimize proxy risk; versioned migrations for Phase 2+

## F) Phased build plan
### Phase 1 (MVP, 8-12 weeks)
1. Core account/character/auth + world sync.
2. Combat, loot, XP, skills, inventory, bank.
3. Quests, crafting, NPC shops.
4. Auction house (offchain) + trade.
5. Wallet connect + signed claims + dashboard.

### Phase 2 (Live-ops hardening)
- Redis queues, anti-bot scoring engine, moderation tools.
- Indexer + treasury accounting + seasonal events.
- Guilds/friends/mail and richer dungeon mechanics.

### Phase 3 (scale + content)
- Multi-zone shards, party finder, raids, cosmetic economy.
- Optional onchain escrow marketplace path.
- Mobile-optimized client and CDN asset pipeline.

## Database schema coverage
Implemented in Prisma schema: users, characters, character_stats, character_skills, inventory_slots, bank_slots, item_defs, npcs, enemies, drop_tables, quests, quest_progress, auction_listings, trade_logs, wallets, economy_ledger, claim_history, suspicious_activity, session_logs, telemetry_events.
