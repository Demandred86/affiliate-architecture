# ADR-0015: Lean M2 MVP scope

Date: 2026-08-25
Status: Accepted (architecture review 2026-08-25)

## Context

The original M2 WBS summed to **143.5h** (P0 **117.25h**). The overall architecture was **approved**, but that envelope does not match an MVP whose only job is to prove:

CSV → import → database → keyword analysis → deterministic opportunity scoring → report

with **zero paid LLM/API calls**, in about **20–35 engineering hours**.

Keeping every original P0 ticket would recreate the 117h plan under a new name. That is rejected.

## Decision

1. **Architecture (target) is unchanged:** Postgres production dialect, PGlite locally, Drizzle, Zod, agent contracts, provenance, deterministic-first analysis, cost controls, multi-agent future, full ERD as documentation, human publish gates later, prompt/agent versioning.
2. **M2 implementation is a slice**, documented here and in [M2_PLAN.md](../M2_PLAN.md). Only code that serves the acceptance pipeline is written.
3. **Supersedes (for M2 only):**
   - ADR-0005: **do not** implement `JobQueue` / `job` table in M2. Sequential CLI is enough. Redis/BullMQ remains M3+.
   - ADR-0011: JSON logs to stdout; **no** `audit_event` table in M2. Auditability = `import_batch` + `import_row` + `agent_run` + `cost_event`.
   - ADR-0014: **no** OpenAI/Anthropic/Mock LLM adapters in M2. `AIProvider` may exist as a tiny unused seam. Budgets still apply (`MAX_PROJECT_BUDGET_USD` added).
4. **Does not supersede:** ADR-0003, 0004, 0006, 0007, 0008, 0009, 0010, 0012, 0013.

## M2 migrated tables (only)

`niche`, `niche_alias` (required for CSV label `Lawn & Garden`), `keyword`, `keyword_alias`, `import_batch`, `import_row`, `keyword_metric`, `facet`, `keyword_facet`, `keyword_cluster`, `keyword_cluster_member`, `keyword_analysis`, `keyword_score`, `agent_prompt`, `agent_run`, `cost_event`.

Not migrated in M2: `job`, `task`, `audit_event`, `human_review`, `change_proposal`, all SERP/product/article tables.

## Consequences

- First pipeline run is offline and **$0**.
- LLM fallback, CI, Docker, HTTP, Next.js, multi-provider, PG parity jobs, and task-tracker sync are **out of M2**.
- Original ticket IDs are reclassified A/B/C/D in [TASKS.md](../TASKS.md); executable work is the **M2-L*** list (~32.5h).
