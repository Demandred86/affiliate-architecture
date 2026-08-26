# M2.5 — First Article MVP

Status: **Complete (M2.5)**  
Date: 2026-08-26  
Primary keyword: **best pruning shears for small hands**

---

## 1. Objective

Build and validate **one** real, publishable affiliate SEO comparison page using **static data only**—before investing in M3 automation, LLM APIs, or scaled content generation.

**Question this milestone answers:** Can one evidence-backed, genuinely useful commercial page attract search traffic and generate affiliate clicks?

---

## 2. Scope

### In scope (implemented)

- Static affiliate comparison page at `apps/site/dist/best-pruning-shears-for-small-hands/index.html`
- Evidence-first product data (`apps/site/data/products.json`, `sources.json`)
- Hand-size decision tool (deterministic JavaScript, no AI)
- Affiliate link placeholders (empty URLs → disabled CTAs)
- SEO metadata, FAQ, structured data (Article + ItemList/Product without fabricated ratings/prices)
- Tests for hand-size engine and data validation
- Documentation and human task checklist

### Explicitly out of scope (not implemented)

- AI agents, LLM integrations, paid APIs
- Automatic article generation or publishing
- Price scraping, affiliate discovery automation
- Multi-site architecture, databases for content, queues, embeddings
- M3+ pipeline features

---

## 3. Files created / modified

| Path | Purpose |
|------|---------|
| `apps/site/package.json` | Site workspace package |
| `apps/site/data/products.json` | Five products with provenance |
| `apps/site/data/sources.json` | Source registry (Level 1–3) |
| `apps/site/data/article.json` | SEO, FAQ, comparisons, quick answers |
| `apps/site/src/types.ts` | Shared types + M9 recommendation placeholder |
| `apps/site/src/hand-size-engine.ts` | Deterministic recommendation logic |
| `apps/site/src/hand-size-engine.test.ts` | Engine unit tests |
| `apps/site/src/validate-data.test.ts` | JSON/data validation tests |
| `apps/site/src/affiliate-links.ts` | Affiliate config (empty placeholders) |
| `apps/site/src/site-config.ts` | Analytics/disclosure placeholders |
| `apps/site/src/format.ts` | Display helpers |
| `apps/site/scripts/build.mjs` | Static HTML generator |
| `apps/site/public/css/styles.css` | Mobile-first styles |
| `apps/site/public/js/hand-size-tool.js` | Browser decision tool |
| `apps/site/dist/…` | Build output (generated) |
| `docs/M2_5_FIRST_ARTICLE.md` | This document |
| `docs/M2_5_MANUAL_CHECKLIST.md` | Human verification steps |
| `docs/tasks.csv` | M2.5 task rows |
| `docs/TASKS.md` | M2.5 summary |
| `package.json` | `build:site` + site in root `build` |

---

## 4. Product data sources

| Product | Primary manufacturer source | Independent source |
|---------|----------------------------|-------------------|
| Okatsune 101 | okatsune-europe.com, okatsune.co.uk | — |
| FELCO 14 | felco.com/products/felco-14 | Gardeners' World review |
| Darlac DP930 | darlac.com, Darlac PDF spec | — |
| FELCO 15 | felco.com/products/felco-15 | — |
| FELCO 6 | felco.com/products/felco-6 | Sprout Authority (hand-fit editorial) |

Source hierarchy documented in page methodology section and `sources.json`.

---

## 5. Evidence limitations

- **No hands-on testing** by us; page language uses “FELCO states…”, “Gardeners' World reported…”, “Our editorial recommendation…”
- **Prices** stored in data as historical observations only—not displayed as current
- **Affiliate relationships** not verified; CTAs show “affiliate link pending”
- **Publication date / author** omitted from schema (not fabricated)

---

## 6. Known conflicts

| Field | Products | Status |
|-------|----------|--------|
| Weight | Okatsune 101 | VERIFY: 177 g (Europe) vs 180 g (UK shop) → shown as approx. 177–180 g |
| Weight | Darlac DP930 | CONFLICT: 146 g (copy/PDF) vs 178 g (WooCommerce field) → not collapsed |
| Hand fit | FELCO 6 | FELCO = Medium; third parties sometimes suggest for smaller hands → editorial note only |

---

## 7. Affiliate placeholders

Configuration: `apps/site/src/affiliate-links.ts` (mirrored in build script).

All `amazonUS` / `retailerUS` fields are **empty**. UI renders non-clickable “Check current price — affiliate link pending”.

---

## 8. Hand-size decision logic

Engine: `apps/site/src/hand-size-engine.ts` (v `1.0.0-m2.5`)

| Condition | Recommendation |
|-----------|----------------|
| Hand length 16–18.5 cm AND palm 7–8.5 cm | Strongly consider Okatsune 101 |
| Slightly above Okatsune range (up to ~20 cm length) | Consider FELCO 6 |
| Priority: lightest weight | Darlac DP930 (with weight VERIFY note) |
| Priority: max capacity | Okatsune 101 |
| Priority: premium/serviceability | FELCO 14 |
| Priority: ergonomic handle | FELCO 15 |
| Missing/invalid input | Okatsune 101 default (low confidence) |

---

## 9. SEO implementation

- Title, meta description, canonical placeholder, OpenGraph tags
- H1 → H2 hierarchy; natural use of primary/secondary keywords
- JSON-LD: `Article` + `ItemList` with `Product` items (no aggregateRating, no offers/price)
- Mobile-first CSS; minimal deferred JS for tool only

---

## 10. Testing performed

```bash
npm install
npm test          # includes hand-size + data validation tests
npm run typecheck
npm run build     # CLI + site static build
```

No `npm run lint` script exists in root (not added—out of M2.5 scope).

---

## 11. Remaining manual tasks (HUMAN)

See [M2_5_MANUAL_CHECKLIST.md](./M2_5_MANUAL_CHECKLIST.md). Summary:

- Amazon Associates / retailer affiliate approval
- Replace affiliate URL placeholders
- Verify current prices and availability
- Visual QA (mobile + desktop)
- Domain, hosting, SSL
- Search Console + analytics IDs
- Publish and monitor indexing

**Estimated HUMAN time:** 4–8 hours (excluding affiliate program approval wait).

---

## 12. M3 backlog (intentionally NOT implemented)

| Milestone | Items |
|-----------|-------|
| M3 | Automated evidence research, source extraction, claim conflict detection, price freshness, affiliate link management, article generation, content QA, automated publishing |
| M4 | Multiple articles, internal linking, programmatic content, keyword expansion |
| M5 | SERP tracking, autonomous monitoring, performance-based iteration |
| M6 | Self-improving recommendation system |

**Future learning placeholder:** `RecommendationRecord` type in `apps/site/src/types.ts` for ranking/CTR/conversion feedback—documentation only.

---

## 13. Final verification

| Check | Result |
|-------|--------|
| Paid LLM/API calls | **None** |
| M3 functionality | **Not implemented** |
| Fake affiliate URLs | **None** |
| Fabricated prices on page | **None** |
| Hands-on testing claims | **None** |
