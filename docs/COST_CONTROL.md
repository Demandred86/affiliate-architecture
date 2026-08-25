# COST-CONTROL STRATEGY

Status: **M2 planning — awaiting approval**
Date: 2026-08-25
Related: [AGENTS.md](./AGENTS.md) · [SECURITY.md](./SECURITY.md) · [ADR-0014](./ADR/ADR-0014-model-routing-budget.md)

Covers: cost-control strategy (7) per `MASTER_SPEC.md` §23–§24.

---

## 1. Accounting

Every `agent_run` stores `model`, `input_tokens`, `output_tokens`, `estimated_cost_usd`, `duration_ms`. `cost_event` is append-only for sums.

Price table lives in config (`MODEL_PRICES_JSON` or `packages/ai-provider/src/prices.ts`) with **retrieved-at** date. If a model has no price, cost is `UNAVAILABLE` (null) — **never a guessed average**.

Deterministic and mock runs record `$0` with `provider=none|mock`.

## 2. Controls (cheapest first)

| Control | M2 behaviour |
|---------|----------------|
| Deterministic replacement | Keyword extract/cluster/score: no LLM if confidence ≥ 0.7 |
| Cache / idempotency | Same input + versions ⇒ `CACHED`, no provider call |
| Dedup import | Same file SHA-256 skips re-analysis unless `--force` |
| Cheap vs strong routing | Fallback extractor uses `cheap` class only |
| Temperature 0 | Extractors |
| Max tokens cap | Small JSON objects |
| Daily budget | `DAILY_BUDGET_USD` default `1.00`; exceed ⇒ `BUDGET_EXCEEDED`, no call |
| Per-run cap | `MAX_COST_PER_RUN_USD` default `0.05` |
| Expensive gate | `ALLOW_EXPENSIVE=false` by default; strong models refused |
| Human gate | None required for M2 analysis; required before enabling paid providers in production use |
| No hidden batches | CLI prints estimated remaining budget before paid calls if `> 0` keys configured |

## 3. Expected M2 spend

| Scenario | Expected |
|----------|----------|
| Acceptance run, mock + deterministic | **$0.00** |
| 44 keywords, all high-confidence grammar | **$0.00** LLM |
| Forced `--llm` on 44 short JSON calls, cheap model | typically **well under $2** (order-of-magnitude; not a quote) |
| Strong model / high temperature / unconstrained prose | **Forbidden** by default flags |

These are **planning estimates**, not invoices. Actuals come from `cost_event`.

## 4. Report

Pipeline report includes `total_estimated_cost_usd`, `runs_by_status`, `cache_hits`, `llm_calls`. CI golden fixture expects `0`.

## 5. Later milestones

SERP and PA-API have their own unit costs — extend `cost_event` with `kind=api`. Writer/brief use strong models: require explicit budget increase + human confirmation the first time (`HUMAN` task in M5).
