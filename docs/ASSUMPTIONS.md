# ASSUMPTIONS, GAPS AND INPUT-DATA AUDIT

Status: **M2 planning — awaiting approval**
Date: 2026-08-25
Owner: lead architect
Related: [MASTER_SPEC.md](./MASTER_SPEC.md), [M1_VALIDATION.md](./M1_VALIDATION.md), [M2_PLAN.md](./M2_PLAN.md)

This document records everything that was **not** specified, everything that was
**inferred**, and everything found by inspecting the actual repository and input
data. Per `MASTER_SPEC.md` §1.1 (evidence over assumptions), each item is labelled
so that an assumption can never later be mistaken for a fact.

Legend:

- `FACT` — verified by direct inspection during this planning phase.
- `ASSUMPTION` — a reasonable default chosen to unblock M2; must be confirmed.
- `GAP` — missing information that blocks or degrades a later milestone.
- `DECISION-NEEDED` — requires a human decision before implementation starts.

---

## 1. Repository state (verified)

| ID | Type | Finding |
|----|------|---------|
| RS-01 | FACT | The workspace is a git repository (`master` branch) with **zero commits**. No code, no `package.json`, no CI, no `.gitignore` exists yet. M2 is a true greenfield build. |
| RS-02 | FACT | The only tracked content is `docs/MASTER_SPEC.md`, `docs/M1_VALIDATION.md`, `docs/M1_TOP50_keyword_shortlist.csv`, all currently **untracked** (`?? docs/`). |
| RS-03 | FACT | No git remote is configured (`git remote -v` is empty). There is therefore no backup and no CI target. |
| RS-04 | FACT | `git config user.name` = `Marco Nocentini`. Commit identity is available. |
| RS-05 | FACT | The repository root is `C:\Users\MarcoNocentini\OneDrive\Documenti\Altro` — i.e. **inside a OneDrive-synchronised folder**. See risk R1 and DN-01. |

## 2. Local environment (verified)

| ID | Type | Finding | Consequence |
|----|------|---------|-------------|
| RE-01 | FACT | Node.js **v22.18.0** present. | Node 22 LTS is the runtime baseline. Native `fetch`, `node:test`, ESM, and `--env-file` are all available. |
| RE-02 | FACT | npm **10.9.3** present. | npm workspaces is the zero-install monorepo option. See [ADR-0001](./ADR/ADR-0001-monorepo-npm-workspaces.md). |
| RE-03 | FACT | `pnpm` **not installed**. | pnpm's symlinked `node_modules` also interacts badly with OneDrive. npm chosen. |
| RE-04 | FACT | `docker` **not installed**. | The spec's recommended Docker Compose Postgres/Redis stack **cannot be run today**. This is the single largest deviation driver for M2. See [ADR-0004](./ADR/ADR-0004-pglite-local-postgres-prod.md) and [ADR-0005](./ADR/ADR-0005-defer-redis-bullmq.md). |
| RE-05 | FACT | `psql` / PostgreSQL client **not installed**; no local Postgres server detected. | M2 must be runnable with **zero external services** or the acceptance run cannot be demonstrated. |
| RE-06 | FACT | `python` **not installed**. | Tooling must be Node-only. No Python scripts anywhere in the toolchain. |
| RE-07 | FACT | Shell is **PowerShell on Windows 10/11 (win32 10.0.26200)**. | All scripts must be cross-platform Node scripts, never bash. Inline `-e` scripts are unreliable under PowerShell quoting; use script files. Line-ending policy must be enforced via `.gitattributes`. |

## 3. Input data audit — `M1_TOP50_keyword_shortlist.csv` (verified)

Measured directly from the file:

| Property | Value |
|----------|-------|
| SHA-256 | `4011a7bb6c5fb030c4b85f919a9bcbb3b50b41f9d6fed1b7c7ba49271e793135` |
| Size | 5,335 bytes |
| Line endings | LF only (no CRLF) |
| Encoding | 7-bit ASCII (no non-ASCII characters found) |
| Header | `rank,niche,keyword,opportunity_score,serp_opportunity,reason,research_priority` |
| Columns | 7, consistent across every row |
| Data rows | **44** |
| Unique keywords | 44 (no duplicates) |
| Trailing newline | yes |

Findings and their design consequences:

| ID | Type | Finding | Design consequence |
|----|------|---------|--------------------|
| KD-01 | FACT | The file is named `TOP50` but contains **44 rows**. | Do not rely on the filename. The importer must derive row count from content and record it in `import_batch.row_count`. Never hard-code 50. |
| KD-02 | FACT | The CSV spans **5 niches**: `Lawn & Garden` (10), `Tools / Home Improvement` (10), `Automotive Accessories` (8), `Outdoor / Camping` (8), `Kitchen Micro-Niche` (8). | The dataset is a *multi-niche* research artefact, but M1 selected a single niche. The importer must import all 44 for provenance, and the pipeline must **filter by active niche** rather than assume every row is in scope. |
| KD-03 | FACT | The niche label in the CSV is `Lawn & Garden`, while `M1_VALIDATION.md` names the selected niche **`Problem-Solving Gardening`**. These strings do not match. | A first-class `niche` entity with an **alias list** is required; string equality on niche labels is not safe. |
| KD-04 | FACT | The 10 `Lawn & Garden` rows are **exactly** the 10 keywords of the "first batch" in `M1_VALIDATION.md` and `MASTER_SPEC.md` §4, in the same order. | The first-batch selection is reproducible as `niche = gardening` and needs no separate hard-coded list. This is a useful integration-test assertion. |
| KD-05 | FACT | `opportunity_score` ranges 70–88 and is **not** globally non-increasing with `rank` (e.g. rank 10 scores 79 while rank 11 scores 86). Scores decrease *within* each niche block only. | `rank` is a niche-blocked ordering, **not** a global priority. It must be stored as `source_rank` metadata and must never be used as a cross-niche sort key. |
| KD-06 | FACT | `serp_opportunity` takes only two values: `High`, `Medium`. No `Low` present. | The value set is a coarse 2-level hypothesis, not a measurement. Store as an enum-typed hypothesis metric with a documented ordinal mapping; do not treat as a continuous score. |
| KD-07 | FACT | `research_priority` is `Y` for **all 44 rows**. | The column carries **zero discriminating information**. It must be imported for provenance but must not be an input to any score. |
| KD-08 | FACT | 41 of 44 keywords contain the token ` for `; **3 do not**: `best lightweight garden tools`, `best compact impact driver`, `best lightweight cordless drill`. | The pattern grammar cannot assume `best X for Y`. It needs at least a second production `best <ATTRIBUTE> <PRODUCT>` where the qualifier is a pre-modifier. These 3 rows are mandatory parser fixtures. |
| KD-09 | FACT | Qualifiers recur **across** niches: `small hands` (2 keywords, gardening + tools), `beginners` (9 keywords, 5 niches), `small kitchen` (4), `SUV` (4). | Strongly validates a normalised, niche-independent `facet` vocabulary with a many-to-many `keyword_facet` join, rather than per-keyword free-text attributes. |
| KD-10 | FACT | The `reason` column contains **semicolons but no commas**, so naive comma splitting happens to work on this file. | Do not rely on it. Use a spec-compliant CSV parser and add a quoted-comma fixture, or the next input file will silently corrupt. |
| KD-11 | FACT | The CSV contains **no search volume, no keyword difficulty, no CPC, and no click data**. | Per `MASTER_SPEC.md` §1.1 and §10, these must be modelled as *absent*, never imputed. Consequently the M2 opportunity score is structurally **provisional** — see [SCORING.md](./SCORING.md). |
| KD-12 | ASSUMPTION | `opportunity_score` and `serp_opportunity` are **human/LLM research hypotheses** from M1, not measurements. | Mandated by `MASTER_SPEC.md` §3. They are imported as `keyword_metric` rows with `source_type = HYPOTHESIS`, are excluded from the authoritative score, and are reported side-by-side for comparison only. |

## 4. Business and product assumptions

| ID | Type | Statement |
|----|------|-----------|
| BA-01 | ASSUMPTION | Market `US`, language `en-US`, currency `USD` for all M2 records. Encoded as explicit columns (not hard-coded) so a second market can be added without migration. |
| BA-02 | ASSUMPTION | The single active niche for the M2 pipeline is gardening (`problem-solving-gardening`), with `Lawn & Garden` registered as a CSV alias. The other 4 niches are imported but `status = PARKED`. |
| BA-03 | ASSUMPTION | The revenue target ($100/month, per `M1_VALIDATION.md`) is a **business** goal with no M2 acceptance criterion attached. M2 is infrastructure only; no revenue can be attributed until M8. |
| BA-04 | ASSUMPTION | No Amazon Associates account, PA-API credentials, WordPress instance, Search Console property or paid SEO-data subscription is assumed to exist yet. None are required for M2. Each is a tracked human task for its milestone. |
| BA-05 | GAP | Amazon PA-API access requires an approved Associates account with qualifying sales. Until then product data has no approved source. This blocks **M4**, not M2, but the `ProductDataSource` abstraction must be designed now ([ADR-0007](./ADR/ADR-0007-deterministic-first-agents.md) rationale extends to data sources). |
| BA-06 | GAP | No SERP data provider has been selected or paid for. This blocks **M3**. M2 must not assume any specific vendor's response shape; the SERP tables are designed provider-agnostic. |

## 5. Technical assumptions

| ID | Type | Statement |
|----|------|-----------|
| TA-01 | ASSUMPTION | M2 has a **single operator** (the repository owner) running a local CLI. No multi-user authentication, no RBAC, and no public network surface is built in M2. The design keeps an `actor` column everywhere so audit trails survive the later introduction of real users. |
| TA-02 | ASSUMPTION | Deployment target is undecided. M2 therefore avoids any provider-specific primitive (no serverless-only APIs, no vendor-locked queue). Postgres-compatible storage + a Node process is the only infrastructure contract. |
| TA-03 | ASSUMPTION | An LLM API key may not be available on day one. M2 must therefore complete its full acceptance run with a deterministic `MockProvider` and **$0.00 spend**. LLM usage is an enhancement path, not a dependency. |
| TA-04 | ASSUMPTION | Data volumes in M2 are tiny (tens of keywords). No sharding, partitioning, read replicas, caching tier or search index is justified. Every index added must be justified by an actual query. |
| TA-05 | ASSUMPTION | "Basic opportunity scoring" (`MASTER_SPEC.md` §31.10) means a **deterministic, versioned, auditable formula** — not a trained model. No ML training is in M2 scope. |
| TA-06 | ASSUMPTION | Timestamps are stored as `timestamptz` in UTC; all display formatting happens at the edge. |
| TA-07 | ASSUMPTION | Money is stored as `numeric`, never as float. LLM costs use `numeric(12,6)` because per-run costs are sub-cent. |

## 6. Interpretation of ambiguous spec requirements

| ID | Spec ref | Ambiguity | Chosen interpretation |
|----|----------|-----------|----------------------|
| SI-01 | §31 | The M2 list includes "repository, database, schemas… agent framework" but not a web UI, while §7 recommends Next.js. | No web application in M2. `apps/web` is deferred to M6 when the human-review queue first needs a UI. See [ADR-0006](./ADR/ADR-0006-defer-web-app.md). |
| SI-02 | §7 vs §31 | §7 recommends Redis + BullMQ, but M2's deliverable is a batch pipeline. | No Redis in M2. A `JobQueue` interface with an in-process sequential runner is built now; BullMQ becomes an adapter in M3/M4. See [ADR-0005](./ADR/ADR-0005-defer-redis-bullmq.md). |
| SI-03 | §8 | 23 entities are listed as the minimum database design. | All 23 are **designed** in [DATABASE.md](./DATABASE.md). Only the subset needed by M2 is **migrated**, because migrating unused tables freezes guesses before the requirements are known. See [ADR-0013](./ADR/ADR-0013-forward-only-migrations.md). |
| SI-04 | §8 | "Prisma or Drizzle". | Drizzle. Prisma's `migrate dev` requires a live shadow database, which is impossible without Docker/Postgres on this machine. See [ADR-0003](./ADR/ADR-0003-drizzle-over-prisma.md). |
| SI-05 | §9 / §23 | Agents must have prompts and cost tracking, but §23 forbids calling a model where a deterministic function suffices. | The keyword agent is **deterministic-first**: a grammar/lexicon extractor runs first, and an LLM is invoked only for low-confidence residue. Every run records which path was taken. See [ADR-0007](./ADR/ADR-0007-deterministic-first-agents.md). |
| SI-06 | §25 | Tasks must live in `docs/TASKS.md` **and** `docs/tasks.csv`. | The CSV is the machine-readable source of truth; `TASKS.md` is generated/reviewed prose; a `task` table mirrors the CSV so agents can read status. A checksum guard prevents the three drifting apart. |
| SI-07 | §31 | "At the end of M2 I must be able to run IMPORT → … → REPORT and receive a structured report." | Interpreted as a single command (`pipeline`) that is idempotent, offline-capable, byte-reproducible against a golden fixture, and emits JSON + Markdown + CSV. This is the primary M2 acceptance test. |
| SI-08 | §29 | M2 is "Database + core infrastructure", yet §31 also requires the keyword analysis agent. | §31 governs. The keyword agent and scoring are in M2; SERP work is not (that is M3). |

## 7. Explicitly out of scope for M2

To prevent scope creep, the following are named as **not** M2, each with its milestone:

SERP retrieval and domain classification (M3) · product discovery and Amazon integration (M4) · evidence collection (M4) · content briefs and writing (M5) · fact-checking, SEO QA, affiliate compliance (M6) · WordPress publishing (M7) · Search Console / Bing / Associates analytics (M8) · experiments and learning loop (M9) · autonomous orchestration (M10) · web UI (M6) · multi-user auth (post-M7) · multi-market/multi-language data (post-M10).

Guardrail packages (banned-phrase and numeric-fabrication detectors) **are** built in M2 even though their first consumer is M5/M6, because they are cheap now, they encode the project's core safety rule, and retrofitting them later would mean re-validating already-generated content.

## 8. Open decisions requiring human input

These block or materially change implementation and are the subject of the approval gate.

| ID | Decision | Options | Recommendation | Blocks |
|----|----------|---------|----------------|--------|
| DN-01 | Repository location | (a) move to a non-synced path such as `C:\dev\affiliate-seo-engine`; (b) stay in OneDrive and exclude `node_modules`; (c) stay as-is | **(a)**. OneDrive actively syncing tens of thousands of `node_modules` files and a live database file risks lock contention, corrupted installs and sync storms. Git plus a remote is the correct backup mechanism, not OneDrive. | M2-001, everything after |
| DN-02 | Local database runtime | (a) PGlite embedded Postgres (zero install); (b) install Docker Desktop; (c) hosted Neon/Supabase free tier | **(a) for dev/test now, plus (c) later for staging**. Keeps M2 runnable offline today at $0 with no admin rights, while remaining true to the Postgres dialect. Option (b) additionally requires WSL2 and admin rights. | M2-030 |
| DN-03 | Git remote / backup | (a) GitHub private repo; (b) Cursor-hosted repo; (c) local only | **(a) or (b)** — any remote. Currently a single disk failure loses the project. Also required for CI. | M2-007, M2-008 |
| DN-04 | LLM provider for the keyword agent's fallback path | (a) mock only for M2; (b) OpenAI; (c) Anthropic; (d) both | **(a) for the acceptance run, (b) or (c) wired but optional.** Expected M2 spend is $0–2 either way. | M2-062, M2-063 |
| DN-05 | Effort envelope | (a) full plan ≈ full hardening; (b) P0-only core path | Decide after reviewing [TASKS.md](./TASKS.md) totals. | sequencing |

## 9. Assumption review protocol

Every assumption above carries an ID. The rules:

1. An `ASSUMPTION` may be relied upon in code **only** if the code references its ID in a comment or config key.
2. When an assumption is confirmed or refuted, this file is updated in the same commit and the type changes to `FACT` or the row is struck through with the replacement.
3. A `GAP` may never be closed by inference — only by acquiring the missing data or by an explicit human decision recorded here.
4. At each milestone closeout the whole table is re-read; stale assumptions are a release blocker.
