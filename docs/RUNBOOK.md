# RUNBOOK — M2 LEAN ACCEPTANCE

Status: **Architecture approved. Implementation not started.**
Date: 2026-08-26
Related: [M2_PLAN.md](./M2_PLAN.md) · [TASKS.md](./TASKS.md) · [SCORING.md](./SCORING.md)

Execute as **M2-L15**. Do not mark M2 complete without verification **and** double-check.

---

## 1. Prerequisites

- Node 22+
- `npm install`
- No Docker, no API keys, no `.env` required
- Input: `docs/M1_TOP50_keyword_shortlist.csv`

## 2. Commands

```text
npm test
npx ase db migrate
npx ase db seed
npx ase pipeline --file docs/M1_TOP50_keyword_shortlist.csv --niche problem-solving-gardening --out reports/m2-acceptance
```

## 3. Verification

| Step | Pass if |
|------|---------|
| V1 | `npm test` green |
| V2 | Pipeline exit 0 |
| V3 | 44 keywords in DB |
| V4 | Report has exactly 10 gardening first-batch keywords |
| V5 | Each of 10: analysis + `OPPORTUNITY_SCORE` + `missing_inputs` includes `search_volume` |
| V6 | Each of 10: `M1_HYPOTHESIS_SCORE` with `source_type=HYPOTHESIS` |
| V7 | Zero `SERP_SCORE` rows |
| V8 | Report `total_estimated_cost_usd === 0` and `llm_calls === 0` |
| V9 | Second pipeline without `--force`: no duplicate keywords |
| V10 | Guardrail tests: `we tested` and invented number rejected |
| V11 | No `serp_query` (or other M3+) tables in migrations |

## 4. Double-check

| Step | Pass if |
|------|---------|
| D1 | `best lightweight garden tools` is `BEST_ATTRIBUTE_X` |
| D2 | Mutating `M1_HYPOTHESIS_SCORE` does not change `OPPORTUNITY_SCORE` |
| D3 | Parked niches absent from default report |
| D4 | Markdown report does not claim measured volume/traffic/rankings |
| D5 | `agent_run.model` is `deterministic` |

## 5. Failures

| Symptom | Action |
|---------|--------|
| OneDrive/PGlite lock | Put `data/` outside sync; gitignore it |
| Partial import | Read `import_row.reject_reason` |
| Non-zero cost | No provider should be wired; unset keys |
