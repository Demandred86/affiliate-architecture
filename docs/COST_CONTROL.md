# COST-CONTROL STRATEGY

Status: **Target architecture approved.** M2 slice per [ADR-0015](./ADR/ADR-0015-lean-m2-mvp.md).
Date: 2026-08-25
Related: [AGENTS.md](./AGENTS.md) · [SECURITY.md](./SECURITY.md) · [ADR-0014](./ADR/ADR-0014-model-routing-budget.md) · [ADR-0015](./ADR/ADR-0015-lean-m2-mvp.md)

Covers: cost-control strategy (7) per `MASTER_SPEC.md` §23–§24.

---

## 1. Accounting

Every `agent_run` stores `model`, `input_tokens`, `output_tokens`, `estimated_cost_usd`, `duration_ms`. `cost_event` is append-only for sums.

M2 runs are **deterministic** (`provider=none`, `model=deterministic`). Tokens and USD are **0**.

If a model has no price, cost is `UNAVAILABLE` (null) — **never a guessed average**. M2 does not ship a vendor price table.

## 2. Budget hierarchy (all three required)

Config (Zod-validated env):

| Variable | Default (M2) | Meaning |
|----------|----------------|---------|
| `MAX_COST_PER_RUN_USD` | `0.05` | Cap for a single `agent_run` |
| `DAILY_BUDGET_USD` | `1.00` | Cap for calendar-day sum of `cost_event` |
| `MAX_PROJECT_BUDGET_USD` | `5.00` | Cap for **lifetime** sum of `cost_event` in this database |

Any pending call whose estimated cost would exceed **any** remaining cap is refused with `BUDGET_EXCEEDED` and **must not** call a provider.

`ALLOW_EXPENSIVE` stays `false`. M2 has no paid provider wired, so the acceptance pipeline cannot spend money even if flags are mis-set — there is no adapter to call.

## 3. Controls (cheapest first)

| Control | M2 MVP |
|---------|--------|
| Deterministic replacement | Keyword extract/cluster/score: **no LLM path** |
| Cache / idempotency | Same input + versions ⇒ reuse `agent_run`, `$0` |
| Dedup import | Same file SHA-256 skips duplicate keywords unless `--force` |
| Project / daily / per-run caps | Enforced before any future provider call |
| Human gate | Required before enabling paid providers (not M2) |

## 4. Expected M2 spend

| Scenario | Expected |
|----------|----------|
| Acceptance pipeline | **$0.00** (required) |
| Cursor/AI **implementation** assistance | See [M2_PLAN.md](./M2_PLAN.md) § estimated Cursor cost — **not** billed through `cost_event` |

## 5. Report

Pipeline report includes `total_estimated_cost_usd` (must be `0`), `runs_by_status`, `cache_hits`, `llm_calls` (must be `0`).

## 6. Later milestones

Vendor adapters, price tables, SERP/PA-API `cost_event.kind=api`, and human confirmation before first paid writer run.
