# OPPORTUNITY SCORING — MODEL v1

Status: **Target architecture approved.** M2 slice per [ADR-0015](./ADR/ADR-0015-lean-m2-mvp.md).
Date: 2026-08-25
Related: [DATABASE.md](./DATABASE.md) · [AGENTS.md](./AGENTS.md) · [M1_VALIDATION.md](./M1_VALIDATION.md)

`MASTER_SPEC.md` §3: M1 opportunity scores are **research hypotheses**, not measurements. §10: never invent search volume.

---

## 1. Three score families (do not conflate)

| Family | Storage | M2 |
|--------|---------|----|
| **`M1_HYPOTHESIS_SCORE`** | `keyword_metric.metric_name = M1_HYPOTHESIS_SCORE`, **`source_type = HYPOTHESIS`**, `source_name = m1-csv` | CSV column `opportunity_score`. Display only. **Never** an input to the formula. |
| **`M1_HYPOTHESIS_SERP_LABEL`** | `keyword_metric` text `High`/`Medium`, `source_type = HYPOTHESIS` | CSV column `serp_opportunity`. **Not** `SERP_SCORE`. |
| **`OPPORTUNITY_SCORE`** | `keyword_score.score_kind = OPPORTUNITY_SCORE`, model `opportunity-v1` | Deterministic analysis-only formula below. Band is always `PROVISIONAL_*`. |
| **`SERP_SCORE`** | `keyword_score.score_kind = SERP_SCORE` | **M3.** No rows. Listed in `missing_inputs` as `serp_retrieved`. |

Do **not** invent search volume, keyword difficulty, traffic, rankings, CPC, or revenue.

## 2. What `OPPORTUNITY_SCORE` v1 is and is not

**Is:** a versioned formula using only import + keyword analysis fields; declares missing commercial inputs; orders the gardening batch provisionally.

**Is not:** a traffic or revenue forecast. No monthly-visit numbers in the report.

## 3. Inputs

| Input | Source | Present in M2? |
|-------|--------|----------------|
| Pattern, intent, facets, cluster size, analysis confidence, niche active | `keyword_analysis` + cluster + niche | Yes |
| Search volume, KD, CPC, AOV | MEASURED metrics | **No** |
| Retrieved SERP | `SERP_SCORE` / `serp_query` | **No** |
| `M1_HYPOTHESIS_SCORE` | metric HYPOTHESIS | Yes, **report only** |

## 4. Formula `opportunity-v1` (1.0.0)

All component scores are 0–1. Weights sum to 1.

```
specificity       = f(has_qualifier, facet_count, pattern_type)
commercial_intent = COMMERCIAL_INVESTIGATION or TRANSACTIONAL → 1.0
                    MIXED → 0.6; INFORMATIONAL → 0.3; UNKNOWN → 0.2
cluster_support   = min(1, (cluster_size - 1) / 4)
extraction_ok     = analysis.confidence
niche_fit         = 1 if niche ACTIVE else 0

raw = 0.35 * specificity
    + 0.30 * commercial_intent
    + 0.15 * cluster_support
    + 0.15 * extraction_ok
    + 0.05 * niche_fit

data_completeness = 0.40   # analysis-only; 60% is volume/KD/SERP/economics

score = round(raw * 100, 3)
band  = PROVISIONAL_HIGH | PROVISIONAL_MEDIUM | PROVISIONAL_LOW
```

`missing_inputs` always includes at least:

`search_volume`, `keyword_difficulty`, `cpc`, `serp_retrieved` (i.e. future **SERP_SCORE**), `aov_or_commission`.

Default report: `--niche problem-solving-gardening` only (10 keywords). Parked niches are imported, not the default report.

## 5. Why M1 is not blended

Blending CSV 70–88 into `OPPORTUNITY_SCORE` would round-trip the spreadsheet. Report columns:

| Column | Family |
|--------|--------|
| `opportunity_score` / `v1_score` | `OPPORTUNITY_SCORE` |
| `m1_hypothesis_score` | `M1_HYPOTHESIS_SCORE` |
| `m1_serp_label` | `M1_HYPOTHESIS_SERP_LABEL` |
| `serp_score` | absent / `UNAVAILABLE` |

A large delta vs M1 is a **research question**, not a test failure. **No test may assert `OPPORTUNITY_SCORE` equals the CSV number.**

## 6. Versioning

Formula in `packages/scoring`. `model_version` on every `keyword_score` row. Weight changes ⇒ new version (M9: `change_proposal` + human approval — table not in M2).

## 7. Scoring tests (M2)

- Ten gardening keywords: non-null `OPPORTUNITY_SCORE`, `missing_inputs` contains `search_volume`.
- `keyword_metric` for those rows: `M1_HYPOTHESIS_SCORE` + `source_type=HYPOTHESIS`.
- Zero `SERP_SCORE` rows.
- Mutating `M1_HYPOTHESIS_SCORE` does not change `OPPORTUNITY_SCORE`.
