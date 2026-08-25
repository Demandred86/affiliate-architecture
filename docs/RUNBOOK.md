# RUNBOOK — M2 VERIFICATION AND OPERATIONS

Status: **M2 planning — awaiting approval**
Date: 2026-08-25
Related: [TASKS.md](./TASKS.md) · [API.md](./API.md) · [SCORING.md](./SCORING.md)

Covers: verification and double-check procedures (12). Execute M2-150 / M2-151 using this file. **Do not mark M2 complete without both sections.**

---

## 1. Prerequisites

- Node 22+ (`node -v`)
- `npm install` at repo root
- No Docker required
- `.env` may be absent (mock defaults)
- Input file: `docs/M1_TOP50_keyword_shortlist.csv`
- Optional: `CLOCK_ISO=2026-08-25T12:00:00.000Z` for reproducible reports

## 2. Happy-path operator commands (after implementation)

```text
npx ase db migrate
npx ase db seed
npx ase pipeline --file docs/M1_TOP50_keyword_shortlist.csv --niche problem-solving-gardening --out reports/m2-acceptance
```

Expected: exit 0, cost $0, 10 keywords in report, 44 in database.

## 3. Verification procedure (M2-150)

Run in order. Record actual outputs in the milestone closeout (M2-152).

| Step | Action | Pass if |
|------|--------|---------|
| V1 | `npm test` | All tests green |
| V2 | Pipeline command above | Exit 0 |
| V3 | Count keywords in DB | 44 rows |
| V4 | Count report keywords | 10; set equals M1 first batch |
| V5 | Open JSON report | `m1_opportunity_score` labelled hypothesis; `missing_inputs` includes `search_volume` |
| V6 | Lightweight keyword | `best lightweight garden tools` has `patternType=BEST_ATTRIBUTE_X` |
| V7 | Cost field | `total_estimated_cost_usd` is `0` |
| V8 | Re-run pipeline without `--force` | No duplicate keywords; cost still 0; analysis ids stable |
| V9 | Import a fixture CSV with an extra column | Row rejected; batch `PARTIAL`; other rows ok |
| V10 | Unit: banned phrase | Fixture output `we tested` → `FABRICATED_EXPERIENCE` |
| V11 | Unit: invented number | Output contains `12345` not in input → `FABRICATED_NUMERIC` |
| V12 | `git status` / secret scan | No `.env` tracked; no API keys in repo |
| V13 | Layer lint | Agent package does not import another agent |
| V14 | File SHA-256 of input | Matches `4011a7bb6c5fb030c4b85f919a9bcbb3b50b41f9d6fed1b7c7ba49271e793135` or documented replacement |

## 4. Idempotency extra check

```text
npx ase pipeline ... --out reports/m2-a
npx ase pipeline ... --out reports/m2-b
```

Compare canonicalised JSON (strip `runId`/`generatedAt` if not frozen). They must be equal.

## 5. Double-check procedure (M2-151)

Different from §3: do **not** only re-run the same tests.

| Step | Action | Pass if |
|------|--------|---------|
| D1 | Manually open CSV; pick rank 8 `best lightweight garden tools`; query DB analysis | Grammar path deterministic; no LLM `agent_run` unless `--llm` |
| D2 | Query `keyword_metric` for one keyword | `source_type=HYPOTHESIS` for `m1_opportunity_score` |
| D3 | UPDATE a hypothesis metric in DB; re-`score` | `v1_score` unchanged |
| D4 | Read `keyword_score.missing_inputs` | Never empty in M2 |
| D5 | Confirm parked niches | Tools/auto/outdoor/kitchen keywords `PARKED` or equivalent; absent from default report |
| D6 | Confirm no M3 tables | `\dt` / drizzle schema has no `serp_query` |
| D7 | Read report Markdown | No phrase “we tested”; no invented monthly traffic |
| D8 | Second person or later session: follow §2 from a clean `data/` dir | Same 10 keywords |
| D9 | Spot-check cluster | Tomato trellis + plant support share a cluster |
| D10 | Compare v1 order vs M1 rank | Deltas documented as informational, not failures |

## 6. Failure handling

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| PGlite lock / OneDrive | Sync conflict | Move `data/` off OneDrive (DN-01) |
| Partial import | Malformed row | Inspect `import_row.reject_reason` |
| Empty analysis | Grammar bug | Fix lexicon; do not invent via LLM in tests |
| Non-zero cost | Provider selected | Unset keys; `AI_PROVIDER=mock` |

## 7. What this runbook does not cover

SERP APIs, Amazon, WordPress, production deploy — later milestones.
