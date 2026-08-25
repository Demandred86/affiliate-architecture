# API AND CLI CONTRACTS

Status: **M2 planning — awaiting approval**
Date: 2026-08-25
Related: [ARCHITECTURE.md](./ARCHITECTURE.md) · [AGENTS.md](./AGENTS.md)

There is **no HTTP API in M2**. This file defines the operator CLI and the internal package contracts. HTTP is reserved (`apps/api`, M7).

---

## 1. CLI (`apps/cli`)

Binary name: `ase` (affiliate SEO engine) via `npm run ase -- …` and workspace bin.

Global flags: `--env-file`, `--json-logs`, `--dry-run`, `--force`.

| Command | Purpose | Exit codes |
|---------|---------|------------|
| `ase db migrate` | Apply Drizzle migrations | 0 ok, 2 migrate fail |
| `ase db seed` | Niches, facets, scoring model, tasks | 0/2 |
| `ase import --file <path>` | Parse CSV → import_batch/rows/keywords/metrics | 0 complete, 1 partial, 2 failed |
| `ase analyze [--niche slug] [--keyword-id]` | Keyword agent | 0/1/2 |
| `ase score [--niche slug]` | opportunity-v1 | 0/2 |
| `ase report [--niche slug] --out <dir>` | JSON + Markdown + CSV | 0/2 |
| `ase pipeline --file <path> [--niche slug] --out <dir>` | import→analyze→score→report | 0/1/2 |
| `ase tasks sync` | CSV → `task` table | 0/2 |
| `ase tasks list` | Print status | 0 |

`pipeline` is the M2 acceptance entrypoint. It is idempotent without `--force`.

### 1.1 Report artefacts

Directory `reports/<runId>/` (gitignored):

- `m2-keyword-report.json` — machine-readable, schema-versioned
- `m2-keyword-report.md` — human
- `m2-keyword-report.csv` — spreadsheet
- `m2-run-manifest.json` — file SHA-256, git commit if any, agent versions, total cost, duration

JSON schema (conceptual): `{ "schemaVersion": "1.0.0", "niche", "generatedAt", "cost", "keywords": [ { keyword, analysis, v1_score, v1_band, missing_inputs, m1_* } ], "clusters": [], "warnings": [] }`.

`generatedAt` is taken from injectable `Clock` so golden tests freeze time.

## 2. Internal contracts

Published as TypeScript types from `packages/schemas` (not npm-public in M2):

- `Provenance`
- `KeywordRow` / `ImportBatch`
- `KeywordAnalysis` (agent output)
- `KeywordScore`
- `AgentRun`
- `AppError` with stable `code` enum

Versioning: `schemaVersion` field on report JSON; breaking changes bump M2 report schema and golden files together.

## 3. Future HTTP (not implemented)

Sketch only: `POST /v1/pipeline/run`, `GET /v1/keywords`, `POST /v1/reviews` — all authenticated. Do not implement in M2.
