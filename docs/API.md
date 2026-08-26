# API AND CLI CONTRACTS

Status: **Target architecture approved.** M2 CLI slice per [ADR-0015](./ADR/ADR-0015-lean-m2-mvp.md).
Date: 2026-08-26
Related: [ARCHITECTURE.md](./ARCHITECTURE.md) · [AGENTS.md](./AGENTS.md)

There is **no HTTP API in M2**. This file defines the operator CLI. HTTP is reserved (`apps/api`, M7).

---

## 1. CLI (`apps/cli`)

Binary name: `ase` via `npm run ase -- …` and workspace bin.

Global flags: `--env-file`, `--json-logs`, `--dry-run`, `--force`.

| Command | Purpose | Exit codes |
|---------|---------|------------|
| `ase db migrate` | Apply Drizzle migrations | 0 ok, 2 migrate fail |
| `ase db seed` | Niches, aliases, facets, scoring model | 0/2 |
| `ase import --file <path>` | CSV → import_batch/rows/keywords/metrics | 0 complete, 1 partial, 2 failed |
| `ase analyze [--niche slug] [--keyword-id]` | Keyword agent (deterministic) | 0/1/2 |
| `ase score [--niche slug]` | `OPPORTUNITY_SCORE` v1 | 0/2 |
| `ase report [--niche slug] --out <dir>` | JSON + Markdown | 0/2 |
| `ase pipeline --file <path> [--niche slug] --out <dir>` | import→analyze→score→report | 0/1/2 |

No `ase tasks sync`. `pipeline` is the M2 acceptance entrypoint. Idempotent without `--force`.

### 1.1 Report artefacts

`reports/<runId>/` (gitignored):

- `m2-keyword-report.json`
- `m2-keyword-report.md`
- `m2-run-manifest.json` (file SHA-256, versions, total cost)

CSV spreadsheet export is **deferred**.

JSON must distinguish `opportunity_score` (`OPPORTUNITY_SCORE`) from `m1_hypothesis_score` (`M1_HYPOTHESIS_SCORE`, hypothesis). `serp_score` is absent/`UNAVAILABLE`. `cost.total_estimated_cost_usd` is `0`. `llm_calls` is `0`.

Versioning: `schemaVersion` on report JSON. Frozen golden-byte tests are deferred; integration asserts structure and counts.

## 2. Internal contracts

Types from `packages/schemas`: `Provenance`, import/keyword, `KeywordAnalysis`, `KeywordScore`, `AgentRun`, `AppError`.

## 3. Future HTTP (not implemented)

Sketch only: `POST /v1/pipeline/run`, `GET /v1/keywords`, `POST /v1/reviews` — all authenticated. Do not implement in M2.
