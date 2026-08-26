# TASKS — LEAN M2 MVP

Status: **Architecture approved. Implementation not started.**
Date: 2026-08-25
Authoritative executable list: [tasks.csv](./tasks.csv)
Old-ticket mapping: [M2_TASK_RECLASS.csv](./M2_TASK_RECLASS.csv)
Related: [M2_PLAN.md](./M2_PLAN.md) · [ADR-0015](./ADR/ADR-0015-lean-m2-mvp.md)

The previous **117.25h P0 / 143.5h** WBS is **superseded**. Do not preserve it as the implementation queue.

---

## 1. Totals

| Class | Meaning | Hours |
|-------|---------|------:|
| **A — REQUIRED FOR M2 MVP** | [tasks.csv](./tasks.csv) M2-L01–L15 | **32.5** |
| **B — USEFUL BUT DEFERRED** | After M2, before/during later milestones | 0 in this sprint |
| **C — M3+** | Needs later milestone | 0 in this sprint |
| **D — REMOVE** | Do not implement | 0 |

Calendar: **about 4–6 working days** for one experienced TypeScript developer.

## 2. Milestone acceptance

[M2_PLAN.md](./M2_PLAN.md) §4. Short form: offline `pipeline` on the M1 CSV, 44 imported / 10 reported, `OPPORTUNITY_SCORE` vs `M1_HYPOTHESIS_SCORE`, no `SERP_SCORE`, **$0**, idempotent, guardrails, `npm test`.

## 3. A — Required M2 MVP (32.5h)

| ID | h | Deps | Auto | Human |
|----|--:|------|------|-------|
| M2-L01 | 2.5 | — | Yes | No |
| M2-L02 | 1.5 | L01 | Yes | No |
| M2-L03 | 1.0 | L01 | Yes | No |
| M2-L04 | 2.0 | L01 | Yes | No |
| M2-L05 | 4.0 | L02, L04 | Yes | No |
| M2-L06 | 2.0 | L05 | Yes | No |
| M2-L07 | 2.5 | L06 | Yes | No |
| M2-L08 | 1.0 | L02, L05 | Yes | No |
| M2-L09 | 1.5 | L04 | Yes | No |
| M2-L10 | 3.0 | L06 | Yes | No |
| M2-L11 | 4.0 | L07, L09, L10 | Yes | No |
| M2-L12 | 2.0 | L10, L11 | Yes | No |
| M2-L13 | 2.5 | L10–L12 | Yes | No |
| M2-L14 | 2.0 | L13 | Yes | No |
| M2-L15 | 1.0 | L14 | Partial | Yes (confirm stop) |

Details, AC, validation, and double-check: **[tasks.csv](./tasks.csv)** (one row per ID).

**Critical path hours:** L01+L02+L04+L05+L06+L07+L10+L11+L12+L13+L14+L15 = **27.5h**.

## 4. Reclassification of the previous M2 tickets

A = still required, **folded into M2-L*** (do not execute the old ticket as a separate 1–3h job).

| Old ID | Class | Notes |
|--------|-------|-------|
| H-001 | B | Relocate off OneDrive; not required for pipeline |
| H-002 | A | Decided (PGlite); no remaining hours |
| H-003 | B | Git remote / backup |
| H-004 | C | Vendor LLM keys |
| M2-001 | B | Relocate workspace |
| M2-002 | A | → L01 |
| M2-003 | A | → L01 |
| M2-004 | B | Full ESLint/Prettier suite; L01 only `.gitattributes` LF |
| M2-005 | A | → L01 vitest; no coverage ratchet |
| M2-006 | D | Husky |
| M2-007 | B | CI beyond `npm test` |
| M2-008 | B | Push to remote |
| M2-010 | A | → L02 |
| M2-011 | A | → L02 (no vendor fail-closed; no adapters) |
| M2-012 | A | → L02 + project budget |
| M2-020 | A | → L03 |
| M2-021 | B | `audit_event` table |
| M2-022 | B | Dedicated redaction suite |
| M2-030 | A | → L05 |
| M2-031 | A | → L05 |
| M2-032 | A | → L05 |
| M2-033 | A | → L05 |
| M2-034 | A | → L05 |
| M2-035 | A | → L05 |
| M2-036 | A | → L05 (`agent_prompt`/`agent_run`/`cost_event` only) |
| M2-037 | C | `task`/`audit`/`human_review`/`change_proposal` |
| M2-038 | A | Minimal uniques inside L05 |
| M2-039 | A | → L05 |
| M2-040 | A | → L06 |
| M2-041 | A | → L06 |
| M2-042 | B | Real Postgres parity |
| M2-050 | A | → L04 |
| M2-051 | A | → L04 |
| M2-052 | A | → L04 |
| M2-053 | A | → L04 |
| M2-054 | A | → L04 |
| M2-060 | B | Full AIProvider package |
| M2-061 | B | MockProvider |
| M2-062 | C | OpenAI |
| M2-063 | C | Anthropic |
| M2-064 | C | Price table |
| M2-065 | A | → L08 |
| M2-066 | A | → L08 |
| M2-070 | A | → L07 |
| M2-071 | B | Retry/repair loops |
| M2-072 | A | → L07 |
| M2-073 | A | → L07 hash/version prompts |
| M2-074 | B | JobQueue |
| M2-075 | A | → L07 |
| M2-076 | A | → L07 |
| M2-080 | A | → L09 |
| M2-081 | A | → L09 |
| M2-082 | B | Untrusted wrapping for LLM |
| M2-083 | A | → L09 fixtures |
| M2-090 | A | → L10 |
| M2-091 | A | → L10 |
| M2-092 | A | → L10 |
| M2-093 | A | → L10 |
| M2-094 | A | → L10 `M1_HYPOTHESIS_SCORE` |
| M2-095 | A | → L10 |
| M2-096 | A | → L10 reject bad rows |
| M2-100 | A | → L11 |
| M2-101 | A | → L11 |
| M2-102 | A | → L11 |
| M2-103 | A | → L11 |
| M2-104 | A | → L11 |
| M2-105 | A | → L11 small related-candidate list |
| M2-106 | C | LLM fallback |
| M2-107 | A | → L11 |
| M2-108 | A | → L11/L14 |
| M2-110 | A | → L12 |
| M2-111 | A | → L12 |
| M2-112 | A | → L12 side-by-side hypothesis |
| M2-113 | A | → L12 |
| M2-114 | A | → L14 |
| M2-115 | A | → L12 |
| M2-120 | A | → L13 |
| M2-121 | A | → L13 |
| M2-122 | A | → L13 JSON+MD (CSV report B) |
| M2-123 | B | Frozen golden bytes |
| M2-124 | A | Minimal README in L01/L13 |
| M2-130 | B | Extra unit sweep |
| M2-131 | A | → L14 |
| M2-132 | A | → L14 |
| M2-133 | B | Large fixture pack |
| M2-134 | A | → L14 |
| M2-135 | A | → L14 |
| M2-136 | D | Coverage gate |
| M2-137 | B | Paid-API failure tests |
| M2-140 | D | `ase tasks sync` |
| M2-141 | D | CSV/DB checksum |
| M2-142 | B | CONTRIBUTING (`.env.example` in L02) |
| M2-150 | A | → L15 |
| M2-151 | A | → L15 |
| M2-152 | A | → L15 |
| M2-153 | A | → L15 |

## 5. B / C / D themes (do not implement in M2)

**B:** OneDrive move, git remote, ESLint suite, GitHub Actions, Postgres parity, Mock/AIProvider package, JobQueue, audit table, CSV report + golden files, extra fixtures, CONTRIBUTING, LLM wrapping.

**C:** OpenAI/Anthropic, SERP, products, writer, WordPress, Next.js, Redis, HTTP API, Docker-required flow, `human_review`/`change_proposal` tables, LLM fallback.

**D:** Husky, coverage ratchet, task-tracker DB sync.

## 6. Verification template

A task is `DONE` only with its CSV **validation** and **double-check** both executed.

## 7. Completion records

- **2026-08-26 — M2-L01 DONE:** Installed npm workspaces; verified Node `>=22`, strict ESM build/typecheck, CLI help, LF policy, ignored `node_modules`, and green root tests.
- **2026-08-26 — M2-L02 DONE:** Verified no-env defaults for all three budget caps, `MAX_PROJECT_BUDGET_USD` in `.env.example`, no vendor keys, and `git check-ignore .env`.
- **2026-08-26 — M2-L03 DONE:** Verified one captured pipeline log is valid JSON with `trace_id`, while a sample API key is redacted; no audit/observability additions.
- **2026-08-26 — M2-L04 DONE:** Verified strict provenance/import/analysis/score/report contracts, `HYPOTHESIS`, canonical `M1_HYPOTHESIS_SCORE`, and rejection of `search_volume`.
- **2026-08-26 — M2-L05 DONE:** Applied the sole PGlite migration; verified exactly 16 lean tables, no excluded tables, the gardening alias, one active niche, and four parked niches.
- **2026-08-26 — M2-L06 DONE:** Verified typed repositories, per-test isolated PGlite databases, idempotent canonical insertion, and database-level unique-hash rejection; no agents package or agent SQL exists.
