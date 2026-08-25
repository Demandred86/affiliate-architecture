# DATABASE — FUTURE TABLES (NOT MIGRATED IN M2)

Status: **sketches for M3–M9**
These tables are **designed**, not created, in M2. Do not add empty migrations for them.

## M3 — SERP

**`domain`**: `host` unique, `kind` (`AFFILIATE` · `PUBLISHER` · `RETAILER` · `FORUM` · `REDDIT` · `AMAZON` · `GOV` · `OTHER`), `publisher_strength` as hypothesis until measured.

**`serp_query`**: `keyword_id`, `engine` (`GOOGLE`/`BING`), `locale`, `retrieved_at`, `provider`, `raw_ref` (object storage pointer later), provenance. **No row ⇒ SERP was not checked.**

**`serp_result`**: `query_id`, `position`, `url`, `domain_id`, `title`, `snippet`, `is_paid`.

**`serp_feature`**: `query_id`, `feature` (`AI_OVERVIEW` · `PAA` · `VIDEO` · `SHOPPING` · …).

## M4 — Product and evidence

**`product`**: `asin` nullable unique, `title`, `brand`, `category`, `status`. No fabricated price.

**`product_variant`**: `product_id`, `sku`/`asin`, attributes jsonb.

**`evidence_source`**: `source_type` (manufacturer, official documentation, independent testing, retailer, expert, user review, forum, Reddit, other), `url`, `retrieved_at`.

**`product_evidence`**: `product_id`, `claim`, `claim_kind` (`FACT` · `CLAIM` · `OPINION` · `INFERENCE` · `USER_EXPERIENCE`), `source_id`, `confidence`, `observed_at`.

**`keyword_product`**: relevance join with `role` (`CANDIDATE`/`RECOMMENDED`).

## M5 — Brief and article

**`content_brief`**: `keyword_id`, structured sections including `why_this_page_deserves_to_exist`, `prohibited_claims`, `affiliate_disclosure_requirements`, `agent_run_id`.

**`article`**: `keyword_id`, `brief_id`, `status`.

**`article_version`**: immutable body (markdown), `title`, `h1`, `meta_description`, `prompt`/`model` refs, `agent_run_id`.

## M6 — QA and facts

**`article_fact`**: extracted claim, `verification` (`VERIFIED` · `PARTIALLY_VERIFIED` · `UNVERIFIED` · `CONTRADICTED`), `evidence_source_id`.

**`qa_result`**: `article_version_id`, `gate` (`TECHNICAL` · `FACT` · `AFFILIATE` · `SEO` · `CONTENT`), `verdict` (`PASS`/`FAIL`), `findings` jsonb.

**`affiliate_link`**: `article_version_id`, `product_id`, `url`, `disclosed`.

Critical UNVERIFIED/CONTRADICTED facts block HUMAN_REVIEW (application + check constraint where possible).

## M7 — Publication

**`publication`**: `article_version_id`, `cms` (`WORDPRESS`), `cms_id`, `status` (`DRAFT`/`PUBLISHED`/`UNPUBLISHED`), `published_at` nullable. Default insert is `DRAFT`.

## M8 — Analytics

**`performance_snapshot`**: `publication_id` or `keyword_id`, `source` (`GSC`/`BING`/`ASSOCIATES`/`WORDPRESS`), `captured_at`, impressions, clicks, ctr, position, affiliate clicks, orders, revenue, commission — each with provenance. Missing APIs ⇒ `UNAVAILABLE`, not zero.

## M9 — Learning

**`experiment`**: `hypothesis`, `metric`, `baseline`, `change`, `result`, `decision`, `article_id`.

**`agent_feedback`**: `agent_run_id`, `kind`, `payload` jsonb.

Production prompt/formula/rule changes go through `change_proposal` + `human_review`, never direct UPDATE of active prompt content.
