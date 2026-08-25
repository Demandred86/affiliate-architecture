# OPPORTUNITY SCORING — MODEL v1

Status: **M2 planning — awaiting approval**
Date: 2026-08-25
Related: [DATABASE.md](./DATABASE.md) · [AGENTS.md](./AGENTS.md) · [M1_VALIDATION.md](./M1_VALIDATION.md)

`MASTER_SPEC.md` §3: M1 opportunity scores are **research hypotheses**, not measurements. §10: never invent search volume. §31.10: M2 includes **basic** opportunity scoring.

---

## 1. What v1 is and is not

**v1 is** a deterministic, versioned formula that:

- uses only fields that exist after import + keyword analysis;
- **declares** every missing commercial-data input;
- emits a **provisional** band so the first-batch experiment can be ordered;
- stores M1 scores **beside** the model output for comparison, never as an input.

**v1 is not** a forecast of traffic or revenue. Predicted traffic/revenue columns stay `UNAVAILABLE` until M3/M8 supply measurements. Do not print invented monthly-visit numbers in the M2 report.

## 2. Inputs

| Input | Source | Present in M2? |
|-------|--------|----------------|
| Pattern commerciality | `keyword_analysis.pattern_type` | Yes |
| Intent | `keyword_analysis.intent_type` | Yes |
| Specificity | facet count + qualifier present | Yes |
| Cluster support | size of `keyword_cluster` | Yes |
| Analysis confidence | `keyword_analysis.confidence` | Yes |
| Niche active | `niche.status` | Yes |
| Search volume | metric `search_volume` MEASURED | **No** |
| Keyword difficulty | metric `kd` MEASURED | **No** |
| CPC / AOV | metrics | **No** |
| SERP opportunity (retrieved) | M3 `serp_query` | **No** |
| M1 `opportunity_score` | metric HYPOTHESIS | Yes, **display only** |
| M1 `serp_opportunity` | metric HYPOTHESIS | Yes, **display only** |

## 3. Formula `opportunity-v1` (1.0.0)

All component scores are 0–1. Weights sum to 1.

```
specificity      = f(has_qualifier, facet_count, pattern_type)
                   BEST_X_FOR_Y with qualifier → high
                   BEST_ATTRIBUTE_X → medium-high
                   OTHER → low
commercial_intent = COMMERCIAL_INVESTIGATION or TRANSACTIONAL → 1.0
                   MIXED → 0.6
                   INFORMATIONAL → 0.3
                   UNKNOWN → 0.2
cluster_support   = min(1, (cluster_size - 1) / 4)   # 5+ members → 1
extraction_ok     = analysis.confidence
niche_fit         = 1 if niche ACTIVE else 0

raw = 0.35 * specificity
    + 0.30 * commercial_intent
    + 0.15 * cluster_support
    + 0.15 * extraction_ok
    + 0.05 * niche_fit

data_completeness = 0.40
  # analysis-only features are 40% of a “full” scorecard;
  # volume, KD, SERP, economics are the remaining 60% and are missing.

if niche_fit == 0:
  band = PARKED implied via keyword.status PARKED; still compute raw for transparency
elif data_completeness < 0.25:  # not reachable in v1 if analysis exists
  band = INSUFFICIENT_DATA, score = null
else:
  score = round(raw * 100, 3)   # 0–100 scale for readability
  band = PROVISIONAL_HIGH    if score >= 75
         PROVISIONAL_MEDIUM  if score >= 55
         PROVISIONAL_LOW     otherwise
```

`missing_inputs` is always at least:

```
["search_volume", "keyword_difficulty", "cpc", "serp_retrieved", "aov_or_commission"]
```

Parked-niche keywords are scored but **excluded from the default first-batch report** (`--niche problem-solving-gardening`).

## 4. Why M1 scores are not blended

Blending 88/100 hypotheses into v1 would make the “engine” a round-trip of the spreadsheet. The M2 report columns are:

| Column | Meaning |
|--------|---------|
| `v1_score` | Formula above |
| `v1_band` | Provisional band |
| `data_completeness` | 0.40 in M2 |
| `missing_inputs` | List |
| `m1_opportunity_score` | Hypothesis, labelled as such |
| `m1_serp_opportunity` | Hypothesis |
| `rank_delta` | `m1_source_rank` vs v1 order **within niche** — informational, not a truth metric |

A large delta is a **research question**, not a bug.

## 5. Versioning and change control

- Formula lives in `packages/scoring` as pure functions + golden tests.
- Active version recorded on every `keyword_score` row.
- Changing weights requires a new `model_version` and, after M9, a `change_proposal`. M2 may ship v1.0.0 only.

## 6. Acceptance tests for scoring

- All 10 gardening keywords produce non-null scores and `missing_inputs` containing `search_volume`.
- Parked keywords are not in the default report.
- Mutating an M1 hypothesis metric does **not** change `v1_score` (property test).
- Fixture keyword with `intentType=UNKNOWN` and `patternType=OTHER` scores lower than `BEST_X_FOR_Y` + high confidence.
- No test may assert that v1 equals the CSV `opportunity_score`.
