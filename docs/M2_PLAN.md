# M2 IMPLEMENTATION PLAN

Status: **M2 planning — awaiting approval. No production code until this document is approved.**
Date: 2026-08-25
Related: [ARCHITECTURE.md](./ARCHITECTURE.md) · [TASKS.md](./TASKS.md) · [RUNBOOK.md](./RUNBOOK.md) · [ASSUMPTIONS.md](./ASSUMPTIONS.md)

Covers: proposed M2 implementation sequence (15). **Do not start M3.**

---

## 1. Gate: what “approved” means

Implementation starts only after you confirm:

1. Architecture (layers, CLI-only, PGlite, no Redis/web in M2)
2. ERD and M2 vs future tables
3. Agent + scoring approach (deterministic first, provisional scores)
4. Task list and **143.5h** CSV envelope (P0 **117.25h**) — or an explicit cut list
5. Decisions DN-01 (path), DN-02 (PGlite), DN-03 (remote) — or explicit “stay on OneDrive”

Out of this gate: production TypeScript, migrations, npm packages.

## 2. Sequence (waves)

Work left-to-right. Items in a wave can proceed in parallel after their deps.

| Wave | Name | Tasks | Exit criterion |
|------|------|-------|----------------|
| 0 | Decisions | H-001–H-003 | Path + DB runtime + remote chosen |
| 1 | Foundation | M2-001–M2-005, M2-008 | `npm test` placeholder; first commit |
| 2 | Platform | M2-010–012, 020–022, 050–054 | Config boots; schemas compile |
| 3 | Persistence | M2-030–041 | migrate+seed on PGlite; test DB |
| 4 | Agent platform | M2-060–061, 065–066, 070, 072, 074–076, 080–081, 083 | Mock runner + guardrails unit tests |
| 5 | Capability | M2-090–096, 100–105, 107–108, 110–115 | Import 44; analyse 10; score v1 |
| 6 | Delivery | M2-120–123, 131–132, 134–135 | `ase pipeline` golden |
| 7 | Closeout | M2-150–153 | RUNBOOK V+D; **STOP** |

P1 (CI, vendor LLMs, parity, task sync) may start after Wave 1 (CI) or after Wave 6; they are **not** required to enter Wave 7 if P0 acceptance already holds. P0 in the CSV is **117.25h** of granular tickets — Wave 3 can still ship as a small number of PRs.

## 3. Daily implementation rule

For each task: implement → tests in the same change → run the task’s validation cell → only then `DONE`.

Never claim the pipeline works without [RUNBOOK.md](./RUNBOOK.md) V2–V8.

## 4. Explicit non-goals (will not appear in M2 PRs)

- SERP fetch, product APIs, writer, WordPress, Next.js app, Redis, Prisma, Python
- Publishing without human approval (not even drafts to WP)
- Replacing M1 hypothesis scores with invented volume

## 5. After M2 (preview only)

M3 = SERP agent + provider adapter + `serp_*` migrations. Starts only after your approval of M2 closeout (`MASTER_SPEC.md` §34).

## 6. Document index created in this planning phase

| File | Role |
|------|------|
| [ASSUMPTIONS.md](./ASSUMPTIONS.md) | Facts, gaps, DN-* |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture, repo, tech, dependency graph |
| [DATABASE.md](./DATABASE.md) | ERD + M2 catalog |
| [DATABASE_FUTURE.md](./DATABASE_FUTURE.md) | M3–M9 sketches |
| [AGENTS.md](./AGENTS.md) | Agent map + keyword contract |
| [SCORING.md](./SCORING.md) | opportunity-v1 |
| [SECURITY.md](./SECURITY.md) | Threat model |
| [COST_CONTROL.md](./COST_CONTROL.md) | Budgets |
| [API.md](./API.md) | CLI contracts |
| [ADR/](./ADR/README.md) | Decisions 0001–0014 |
| [TASKS.md](./TASKS.md) | Breakdown, AC, hours |
| [tasks.csv](./tasks.csv) | Tracker import |
| [RUNBOOK.md](./RUNBOOK.md) | Verify + double-check |
| [RISKS.md](./RISKS.md) | Risks |
| This file | Sequence + stop |

## 7. Waiting for you

Reply with approval (and DN-01–03) or requested changes. Until then, **no production code.**
