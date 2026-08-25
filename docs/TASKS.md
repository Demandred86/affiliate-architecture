# TASKS — M2 DATABASE AND CORE INFRASTRUCTURE

Status: **M2 planning — awaiting approval**
Date: 2026-08-25
Source of truth for import: [tasks.csv](./tasks.csv)
Related: [M2_PLAN.md](./M2_PLAN.md) · [RUNBOOK.md](./RUNBOOK.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

Covers: task breakdown (8), estimated effort (10), acceptance criteria (11), automation vs human (13).

---

## 1. Effort summary

Estimates are **engineering hours** for one person who already read this planning set. They include tests for that task.

**[tasks.csv](./tasks.csv) is authoritative.** Generated totals:

| Slice | Hours | Rows |
|-------|------:|------|
| **P0 — required for acceptance** | **117.25** | Core path including granular DB/agent tickets |
| **P1 — hardening** | **24.75** | CI, vendor LLM adapters, LLM fallback, PG parity, extra fixtures |
| **P2 — polish** | **1.5** | Husky, coverage ratchet |
| **All CSV rows** | **143.5** | 96 tasks including H-001–H-004 |

Calendar (one engineer): treat **117h P0** as about **3 full-time weeks**. Combining Wave 3 tables into one migration PR can shrink *elapsed* time without deleting tickets. If DN-04 stays mock-only, defer ~7.5h (M2-062/063/064/106).

Critical path: [ARCHITECTURE.md](./ARCHITECTURE.md) §8.2.

## 2. Epics

| Epic | IDs |
|------|-----|
| Human decisions | H-001–H-004 |
| Foundation | M2-001–M2-008 |
| Config | M2-010–M2-012 |
| Logging | M2-020–M2-022 |
| Database | M2-030–M2-042 |
| Schemas | M2-050–M2-054 |
| AI provider | M2-060–M2-066 |
| Agent core | M2-070–M2-076 |
| Guardrails | M2-080–M2-083 |
| Keyword import | M2-090–M2-096 |
| Keyword agent | M2-100–M2-108 |
| Scoring | M2-110–M2-115 |
| CLI and report | M2-120–M2-124 |
| Test program | M2-130–M2-137 |
| Task sync / docs | M2-140–M2-142 |
| Closeout | M2-150–M2-153 |

## 3. Milestone-level acceptance (M2 done)

The milestone is done only if **all** of the following hold (detail in [RUNBOOK.md](./RUNBOOK.md)):

1. `ase pipeline --file docs/M1_TOP50_keyword_shortlist.csv --niche problem-solving-gardening --out reports/m2-acceptance` exits 0 with **no API keys**.
2. DB contains **44** imported keywords; default report lists **exactly 10** gardening keywords matching M1 first batch order **or** a documented v1 sort with the same 10 set.
3. Every gardening keyword has `keyword_analysis` with pattern `BEST_X_FOR_Y` or `BEST_ATTRIBUTE_X` (the lightweight row).
4. Every score has `missing_inputs` including `search_volume` and `source` of M1 scores is `HYPOTHESIS` in JSON.
5. Re-run without `--force` is a cache/idempotent no-op: same keyword ids, `agent_run` status `CACHED` or zero new cost, report bytes equal after stripping `generatedAt`/`runId` **or** those fields are frozen via `Clock`.
6. Guardrail unit tests reject fabricated “we tested” and invented numbers.
7. `total_estimated_cost_usd === 0` on the acceptance run.
8. No production code for M3+ agents beyond README/contract stubs.
9. Planning docs still match implementation (ADR list, table list).

## 4. Task catalogue

Columns match `tasks.csv`. **Validation** = automated or operator steps to mark done. **Double-check** = independent second pass.

### 4.1 Human decisions

| ID | Title | h | Pri | Auto | Human | Deps |
|----|-------|--:|-----|------|-------|------|
| H-001 | Decide repo location (DN-01) | 1 | P0 | No | Yes | — |
| H-002 | Confirm PGlite (DN-02) | 0.25 | P0 | No | Yes | — |
| H-003 | Create git remote (DN-03) | 0.5 | P0 | Partial | Yes | H-001 |
| H-004 | Optional LLM keys (DN-04) | 0.25 | P1 | No | Yes | — |

**H-001 AC:** Path chosen; if stay on OneDrive, documented exception + `node_modules`/`data` excluded from sync.  
**H-003 AC:** `git remote -v` shows a private remote; first push after M2-008.

### 4.2 Foundation

| ID | Title | h | Pri | Deps | Auto |
|----|-------|--:|-----|------|------|
| M2-001 | Relocate/clone workspace if approved | 2 | P0 | H-001 | Partial |
| M2-002 | npm workspaces scaffold | 2 | P0 | M2-001 | Yes |
| M2-003 | TS strict ESM + references | 2 | P0 | M2-002 | Yes |
| M2-004 | ESLint, Prettier, `.gitattributes` LF | 1 | P0 | M2-003 | Yes |
| M2-005 | Vitest + coverage config | 1.5 | P0 | M2-003 | Yes |
| M2-006 | Git hooks / lint-staged | 1 | P2 | M2-004 | Yes |
| M2-007 | CI (install, test, secret scan) | 2 | P1 | M2-005, M2-008 | Yes |
| M2-008 | Initial commit + push | 0.5 | P0 | M2-002, H-003 | Partial |

**M2-002 AC:** `npm ls -w` shows `apps/cli` and listed packages (even if empty).  
**M2-005 AC:** `npm test` runs and passes a placeholder.

### 4.3 Config and logging

| ID | Title | h | Pri | Deps |
|----|-------|--:|-----|------|
| M2-010 | `packages/config` loader | 2 | P0 | M2-003 |
| M2-011 | Zod env; mock default; fail closed per provider | 1.5 | P0 | M2-010 |
| M2-012 | Budgets and feature flags | 1 | P0 | M2-011 |
| M2-020 | pino JSON logger | 2 | P0 | M2-003 |
| M2-021 | `audit_event` writer (after DB) | 1 | P0 | M2-036, M2-020 |
| M2-022 | Redaction tests | 1 | P0 | M2-020 |

**M2-011 AC:** Boot with empty env uses mock; `AI_PROVIDER=openai` without key throws before any call.

### 4.4 Database

| ID | Title | h | Pri | Deps |
|----|-------|--:|-----|------|
| M2-030 | PGlite + Drizzle project | 3 | P0 | M2-010, H-002 |
| M2-031 | `ase db migrate` | 1.5 | P0 | M2-030 |
| M2-032 | niche, alias, keyword, keyword_alias | 2 | P0 | M2-031, M2-050 |
| M2-033 | import_batch, import_row | 1.5 | P0 | M2-032 |
| M2-034 | facet, joins, cluster, analysis | 2 | P0 | M2-032 |
| M2-035 | keyword_metric, keyword_score | 1.5 | P0 | M2-032 |
| M2-036 | agent_prompt, agent_run, cost_event, job | 2 | P0 | M2-032 |
| M2-037 | task, audit_event, human_review, change_proposal | 1.5 | P0 | M2-032 |
| M2-038 | Indexes + check constraints | 1.5 | P0 | M2-037 |
| M2-039 | Seeds (niches, facets, scoring model) | 1.5 | P0 | M2-038 |
| M2-040 | Repositories | 3 | P0 | M2-038, M2-020 |
| M2-041 | `createTestDb()` | 2 | P0 | M2-040 |
| M2-042 | Optional real Postgres parity | 2 | P1 | M2-031 |

**M2-038 AC:** Cannot insert `keyword_score.score` non-null with band `INSUFFICIENT_DATA`.  
**M2-039 AC:** Gardening niche active; `Lawn & Garden` alias resolves.

### 4.5 Schemas, AI, runtime, guardrails

| ID | Title | h | Pri | Deps |
|----|-------|--:|-----|------|
| M2-050 | Provenance Zod | 1.5 | P0 | M2-003 |
| M2-051 | Import/keyword Zod | 1.5 | P0 | M2-050 |
| M2-052 | KeywordAnalysis Zod | 1.5 | P0 | M2-050 |
| M2-053 | Report Zod | 1 | P0 | M2-052 |
| M2-054 | Error codes | 0.5 | P0 | M2-050 |
| M2-060 | AIProvider interface | 1.5 | P0 | M2-011, M2-050 |
| M2-061 | MockProvider | 2 | P0 | M2-060 |
| M2-062 | OpenAI adapter | 2 | P1 | M2-060 |
| M2-063 | Anthropic adapter | 2 | P1 | M2-060 |
| M2-064 | Price table | 1 | P1 | M2-060 |
| M2-065 | Budget guard | 1.5 | P0 | M2-012, M2-060 |
| M2-066 | cost_event write | 1 | P0 | M2-036, M2-065 |
| M2-070 | AgentRunner | 3 | P0 | M2-040, M2-060, M2-020 |
| M2-071 | Retry/repair | 1.5 | P1 | M2-070 |
| M2-072 | Idempotency | 1.5 | P0 | M2-070 |
| M2-073 | Prompt registry | 1.5 | P1 | M2-036, M2-070 |
| M2-074 | JobQueue in-process | 2 | P0 | M2-036 |
| M2-075 | Persist runs | 1.5 | P0 | M2-070, M2-036 |
| M2-076 | Failure mapping | 0.5 | P0 | M2-070 |
| M2-080 | Banned phrases | 1 | P0 | M2-050 |
| M2-081 | Numeric fabrication | 1.5 | P0 | M2-050 |
| M2-082 | Untrusted wrapping | 1 | P1 | M2-080 |
| M2-083 | Experience fixtures | 1 | P0 | M2-080 |

### 4.6 Import, keyword agent, scoring

| ID | Title | h | Pri | Deps |
|----|-------|--:|-----|------|
| M2-090 | Spec CSV parser | 2 | P0 | M2-051 |
| M2-091 | Import command | 2.5 | P0 | M2-090, M2-040 |
| M2-092 | Normalise/dedupe | 1.5 | P0 | M2-091 |
| M2-093 | Niche aliases | 1 | P0 | M2-039, M2-091 |
| M2-094 | Hypothesis metrics | 1.5 | P0 | M2-091, M2-035 |
| M2-095 | File SHA-256 batch | 0.5 | P0 | M2-091 |
| M2-096 | Reject bad rows | 1.5 | P0 | M2-091 |
| M2-100 | Agent contract wiring | 1 | P0 | M2-052, M2-070 |
| M2-101 | Pattern grammar | 2.5 | P0 | M2-100 |
| M2-102 | Facet lexicon | 2 | P0 | M2-039, M2-100 |
| M2-103 | Intent/slots | 2 | P0 | M2-102 |
| M2-104 | Clusters | 2 | P0 | M2-103 |
| M2-105 | Related candidates | 1.5 | P0 | M2-104 |
| M2-106 | LLM fallback | 2.5 | P1 | M2-061, M2-101 |
| M2-107 | Persist analysis | 1.5 | P0 | M2-034, M2-100 |
| M2-108 | Agent tests (incl. 3 no-`for`) | 2.5 | P0 | M2-101 |
| M2-110 | Formula v1 | 2 | P0 | M2-107 |
| M2-111 | missing_inputs | 1 | P0 | M2-110 |
| M2-112 | M1 side-by-side | 0.5 | P0 | M2-094, M2-110 |
| M2-113 | Persist scores | 1 | P0 | M2-035, M2-110 |
| M2-114 | Scoring tests | 1.5 | P0 | M2-110 |
| M2-115 | Version stamp | 0.5 | P0 | M2-113 |

**M2-096 AC:** Quoted comma fixture; extra column ⇒ row REJECTED, batch PARTIAL.  
**M2-108 AC:** All 10 gardening keywords analysed without LLM.  
**M2-114 AC:** Changing M1 metric does not change v1_score.

### 4.7 CLI, tests, docs, closeout

| ID | Title | h | Pri | Deps |
|----|-------|--:|-----|------|
| M2-120 | Commands import/analyze/score | 2 | P0 | M2-091, M2-107, M2-113 |
| M2-121 | `pipeline` | 1.5 | P0 | M2-120, M2-074 |
| M2-122 | JSON/MD/CSV report | 2.5 | P0 | M2-053, M2-121 |
| M2-123 | Golden fixture | 1.5 | P0 | M2-122 |
| M2-124 | README usage | 1 | P1 | M2-121 |
| M2-130 | Unit sweep leftover | 1 | P1 | M2-108 |
| M2-131 | Schema tests | 1.5 | P0 | M2-052 |
| M2-132 | Hallucination tests | 1.5 | P0 | M2-081, M2-083 |
| M2-133 | Fixture pack | 2 | P1 | M2-096 |
| M2-134 | Integration pipeline | 2.5 | P0 | M2-121, M2-041 |
| M2-135 | Idempotency test | 1 | P0 | M2-134 |
| M2-136 | Coverage gate | 0.5 | P2 | M2-005 |
| M2-137 | Budget/API failure tests | 1.5 | P1 | M2-065 |
| M2-140 | `ase tasks sync` | 1.5 | P1 | M2-037 |
| M2-141 | CSV/MD/DB checksum | 1 | P1 | M2-140 |
| M2-142 | CONTRIBUTING + env example | 1 | P1 | M2-011 |
| M2-150 | Execute RUNBOOK verification | 2 | P0 | M2-134, M2-007 optional |
| M2-151 | Double-check RUNBOOK §5 | 1.5 | P0 | M2-150 |
| M2-152 | Milestone report (spec §34) | 1 | P0 | M2-151 |
| M2-153 | Stop — wait for approval (M3) | 0.5 | P0 | M2-152 |

## 5. Per-task verification template

Every P0 task uses:

- **WHAT / WHY / HOW** — in the CSV description and this file.
- **EXPECTED RESULT** — acceptance criteria cell.
- **HOW TO VERIFY** — validation cell (must be executable).
- **HOW TO DOUBLE-CHECK** — independent of the first command (read code, second query, or mutated fixture).

A task is not `DONE` if only the happy path was run.

## 6. Hours roll-up

Sum `Estimated hours` in [tasks.csv](./tasks.csv) (currently **143.5** total; **117.25** P0). Group by Epic and Priority in the tracker of your choice. If DN-04 stays mock-only, skip or defer M2-062, M2-063, M2-064, M2-106 (~7.5h).
