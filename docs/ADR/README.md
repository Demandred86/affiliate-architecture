# Architecture Decision Records

Status: **M2 planning — awaiting approval**
Date: 2026-08-25

ADRs record **why**, not the full design (that lives in ARCHITECTURE / DATABASE / AGENTS).

| ID | Title | Decision |
|----|-------|----------|
| [0001](./ADR-0001-monorepo-npm-workspaces.md) | Monorepo with npm workspaces | Accepted |
| [0002](./ADR-0002-typescript-node22.md) | TypeScript on Node 22 | Accepted |
| [0003](./ADR-0003-drizzle-over-prisma.md) | Drizzle ORM | Accepted |
| [0004](./ADR-0004-pglite-local-postgres-prod.md) | PGlite locally, Postgres in staging/prod | Accepted |
| [0005](./ADR-0005-defer-redis-bullmq.md) | JobQueue now, BullMQ later | Accepted |
| [0006](./ADR-0006-defer-web-app.md) | No Next.js in M2 | Accepted |
| [0007](./ADR-0007-deterministic-first-agents.md) | Grammar/lexicon before LLM | Accepted |
| [0008](./ADR-0008-uuidv7-provenance.md) | UUID v7 + provenance mixin | Accepted |
| [0009](./ADR-0009-zod-contracts.md) | Zod as shared contract | Accepted |
| [0010](./ADR-0010-provisional-scoring.md) | Scores are provisional without SERP/volume | Accepted |
| [0011](./ADR-0011-structured-logging-pino.md) | pino JSON + audit table | Accepted |
| [0012](./ADR-0012-secrets-env-not-committed.md) | Env secrets, fail closed per provider | Accepted |
| [0013](./ADR-0013-forward-only-migrations.md) | Forward-only SQL migrations | Accepted |
| [0014](./ADR-0014-model-routing-budget.md) | AIProvider + budgets + mock default | Accepted |
