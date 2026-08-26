# M2 IMPLEMENTATION PLAN (LEAN MVP)

Status: **Architecture approved. Implementation not started.** Scope: [ADR-0015](./ADR/ADR-0015-lean-m2-mvp.md).
Date: 2026-08-25
Related: [TASKS.md](./TASKS.md) · [RUNBOOK.md](./RUNBOOK.md) · [ASSUMPTIONS.md](./ASSUMPTIONS.md)

**Do not start M3. Do not write production code until this lean plan is accepted.**

---

## 1. What M2 must prove

```
CSV → import → database → keyword analysis → deterministic OPPORTUNITY_SCORE → report
```

First successful run: **no paid LLM/API calls**, `cost_event` total **$0**.

Keep: Postgres-as-target, PGlite local, Drizzle, Zod, agent contracts, provenance, idempotency, audit via import/agent_run/cost_event, guardrails, prompt/agent versioning, human-approval **model** (no publish, no review table).

## 2. Waves (lean)

| Wave | Tasks | Exit |
|------|-------|------|
| 1 | M2-L01–L04 | Repo + config + schemas + logs |
| 2 | M2-L05–L09 | PGlite schema + runner + budgets + guardrails |
| 3 | M2-L10–L13 | Import, analyze, score, CLI report |
| 4 | M2-L14–L15 | `npm test` + acceptance pipeline + **STOP** |

Critical path: `L01 → L02 → L04 → L05 → L06 → L07 → L10 → L11 → L12 → L13 → L14 → L15` (~27.5h on path). L03, L08, L09 have slack.

## 3. Effort

**32.5 engineering hours** (inside 20–35). The old **117.25h P0 is obsolete.**

## 4. Exact M2 acceptance test

From a clean install, **no `.env` API keys**:

```text
npm install
npm test
npx ase db migrate
npx ase db seed
npx ase pipeline --file docs/M1_TOP50_keyword_shortlist.csv --niche problem-solving-gardening --out reports/m2-acceptance
```

**Pass if and only if:**

1. Exit code 0.
2. `npm test` green (unit + one integration pipeline).
3. Database has **44** keywords; report lists **exactly 10** gardening first-batch keywords.
4. Each of the 10 has `keyword_analysis` (`BEST_X_FOR_Y` or `BEST_ATTRIBUTE_X` for `best lightweight garden tools`).
5. Each of the 10 has `keyword_score.score_kind = OPPORTUNITY_SCORE` with `missing_inputs` containing `search_volume`.
6. Each of the 10 has `keyword_metric` `M1_HYPOTHESIS_SCORE` with **`source_type = HYPOTHESIS`**.
7. **Zero** rows with `score_kind = SERP_SCORE`. Report does not present CSV scores as measured SEO data.
8. Report `total_estimated_cost_usd === 0` and `llm_calls === 0`.
9. Second pipeline without `--force` does not duplicate keywords (idempotent).
10. Guardrail tests reject `we tested` and a number not present in input.
11. No `serp_*` / product / article tables migrated.

## 5. Estimated Cursor / AI cost

Not `cost_event` (that stays $0).

| Item | Estimate | Notes |
|------|----------|--------|
| Pipeline LLM APIs | **$0** | Required |
| Cursor agent to **implement** ~32.5h of TS | **roughly $20–80 USD** of Cursor usage | Depends on model/plan, retries, context. **Not a quote.** |
| If a paid coding model is used heavily | same band; could exceed $80 if loops | Stop and simplify rather than add adapters |

Human review of PRs: unpriced.

## 6. Remaining human decisions

| ID | Blocking code? | Action |
|----|----------------|--------|
| DN-01 OneDrive | No | Recommended: move repo; else exclude `node_modules`/`data` |
| DN-03 git remote | No | Recommended backup |
| Approve this lean plan | **Yes** | Then implementation may start |

## 7. Deferred / removed (summary)

See [TASKS.md](./TASKS.md) B/C/D. Includes: CI beyond `npm test`, Docker, Redis, HTTP, Next.js, OpenAI/Anthropic/Mock LLM, PG parity, task-DB sync, JobQueue, `audit_event`, golden CSV report, coverage ratchet, LLM fallback.

## 8. Stop

After M2-L15: milestone note, **wait**. No M3.
