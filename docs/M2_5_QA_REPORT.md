# M2.5 QA Report — Read-only audit

**Commit:** `ed2b408385d999f2c1cdd82de9d7d1fa85035e59`  
**Date:** 2026-08-26  
**Mode:** Audit only. No application files modified. No M3 work. No LLM/API calls.

---

## Executive summary

The generated page is a credible static MVP: one H1, evidence flags, no fake affiliate URLs, no displayed prices, no fabricated ratings, and no first-person testing claims. Tests and typecheck pass locally.

The **blocking issue** is that article source data (`apps/site/data/*.json`) is **gitignored** by root `.gitignore` (`data/`) and was **not included in commit `ed2b408`**. A clean clone cannot rebuild or re-test the article.

---

## 1. Build / test

| Command | Result |
|---------|--------|
| `npm test` | **PASS** — Vitest v4.1.11; **12 files, 42 tests** passed; duration ~8.1s |
| `npm run typecheck` | **PASS** — `tsc -p tsconfig.json --noEmit` exit 0 |
| `npm run build` | **PASS** — CLI esbuild + `@ase/site` `scripts/build.mjs`; wrote `apps/site/dist/best-pruning-shears-for-small-hands/index.html` |
| `npm run lint` | **FAIL / N/A** — `npm error Missing script: "lint"` (exit 1). No ESLint config in M2.5. Expected for lean M2; not an application defect. |
| `npm run build:site` | Exists; invoked by root `build` |

Site package has `typecheck` but no `lint`. Hand-size + data validation tests ran as part of root `npm test`.

---

## A. PASS

- CSS units are valid compact forms (`42rem`, `1rem`, `-9999px`). Strings like `"42 rem"` / `"1 px"` are **not present**.
- Exactly **one H1**. Viewport, title, meta description, canonical, OpenGraph title/description/url/type present.
- Five product cards; Darlac weight shown as `CONFLICT: 146–178 g (VERIFY)`; Okatsune weight `approx. 177–180 g`.
- FELCO 6 labeled **Medium (M)** in data, table, FAQ, and comparison copy.
- FELCO 15 “up to 30%” attributed to FELCO as a manufacturer claim.
- Historical USD prices exist only in JSON `priceObservations` with VERIFY notes; **not rendered** on the page.
- Empty affiliate URLs render `<span class="cta-disabled">` — five pending CTAs, **zero** `href=""` / invented Amazon URLs.
- Disclosure present; relationships described as not verified.
- User input in the tool is HTML-escaped; no `eval` / remote fetch in site JS.
- No OpenAI/Anthropic/Gemini, no paid APIs, no agents, no auto-publish/scrape in `apps/site`.
- Structured data has **no** `aggregateRating`, `reviewCount`, `offers`, or author/date invention.
- Form fields have matching `<label for>`. Table has caption + `scope="col"` / `scope="row"`.
- JS ~7.1 KB, CSS ~6.2 KB, HTML ~32 KB. No npm UI libraries. Script is `defer`. Page is static.

---

## B. WARNINGS

### W1 — Priority ignores hand measurements

**Severity:** HIGH  
**File:** `apps/site/src/hand-size-engine.ts`  
**Line:** 101–104 (mirrored in `apps/site/public/js/hand-size-tool.js` ~96–99)

**Problem:** If `priority` is set, the engine returns immediately and **never uses** length/width. Examples from this audit:

- empty measurements + `ergonomic_handle` → FELCO 15, **high** confidence  
- 21 cm length + `maximum_cutting_capacity` → Okatsune 101 (Small-range tool)  
- 15.9 cm + `lightest_weight` → Darlac despite unresolved weight conflict  

**Recommended fix:** Apply priority only as a tie-break after fit bands, or lower confidence and keep a fit-based primary pick.

### W2 — Palm-below-min with longer hands still recommends Okatsune 101

**Severity:** MEDIUM  
**File:** `apps/site/src/hand-size-engine.ts`  
**Line:** 139–146

**Problem:** `18.6 cm` length + `6.5 cm` palm hits “below Okatsune range” via `palmWidthCm < 7` and recommends Okatsune 101. Length is *above* the 101 band. Logic treats any undersized *dimension* as “too small” rather than mixed.

**Recommended fix:** Separate “too narrow palm / too short hand / mixed” cases; do not imply both dimensions are below the guide.

### W3 — Dead code after priority short-circuit

**Severity:** LOW  
**File:** `apps/site/src/hand-size-engine.ts`  
**Line:** 116–119

**Problem:** `if (priority === "premium_serviceability")` inside the Okatsune range can never run because priority already returned at line 101.

**Recommended fix:** Remove dead branch or restructure so fit is evaluated first.

### W4 — Dual copies of recommendation logic

**Severity:** MEDIUM  
**File:** `apps/site/src/hand-size-engine.ts` vs `apps/site/public/js/hand-size-tool.js`

**Problem:** Browser script is a manual duplicate. Tests cover TypeScript only. Drift is likely.

**Recommended fix:** Generate the browser bundle from the TS engine, or import a single shared module at build time.

### W5 — Affiliate / site config not used by the HTML builder

**Severity:** MEDIUM  
**File:** `apps/site/scripts/build.mjs`  
**Line:** 15–24  
**Also:** `apps/site/src/affiliate-links.ts`, `apps/site/src/site-config.ts`

**Problem:** Build hard-codes empty `affiliateLinks` and disclosure text. Editing `affiliate-links.ts` (the documented HUMAN path) **does not** change the published page unless `build.mjs` is also edited.

**Recommended fix:** Import one config source in `build.mjs`.

### W6 — Canonical / OG URL is a placeholder

**Severity:** HIGH (publish blocker; OK for local MVP)  
**File:** `apps/site/data/article.json`  
**Line:** 8, 12  
**Rendered:** `apps/site/dist/best-pruning-shears-for-small-hands/index.html` lines 8, 12

**Problem:** `https://YOUR-DOMAIN.example/best-pruning-shears-for-small-hands/` would be a bad canonical if deployed.

**Recommended fix:** Replace before go-live (already on HUMAN checklist).

### W7 — Heading “Product reviews” without testing

**Severity:** LOW  
**File:** `apps/site/scripts/build.mjs`  
**Line:** 286  
**Rendered HTML line:** 143

**Problem:** H2 says “Product reviews” while methodology denies hands-on testing.

**Recommended fix:** Rename to “Product details” or “Evidence summaries”.

### W8 — Darlac copy undercuts the CONFLICT flag

**Severity:** MEDIUM  
**File:** `apps/site/data/products.json`  
**Line:** 198–201 (`whyWeLikeIt`)

**Problem:** “Manufacturer PDF aligns with 146 g when the on-page conflict is ignored” prefers 146 g after correctly marking CONFLICT.

**Recommended fix:** Remove the “when ignored” sentence; keep conflict-only language.

### W9 — FELCO 6 independent-evidence overclaim

**Severity:** MEDIUM  
**File:** `apps/site/data/products.json`  
**Line:** 340–342  
**Source:** `src-sprout-authority-pruners` claims list only FELCO 14, not FELCO 6 (`apps/site/data/sources.json` lines 117–120)

**Problem:** “widespread independent recommendations for general-purpose FELCO quality” is not supported by the cited source row.

**Recommended fix:** Soften wording or add a source that actually discusses FELCO 6.

### W10 — Table “Best for” always truncated with ellipsis

**Severity:** LOW  
**File:** `apps/site/scripts/build.mjs`  
**Line:** 78

**Problem:** `bestFor.slice(0, 80) + "…"` always appends an ellipsis.

**Recommended fix:** Ellipsis only when length > 80.

### W11 — Weak internal linking; no `og:image`; no robots meta

**Severity:** LOW  
**File:** generated HTML head / quick-answer block

**Problem:** Quick answers do not link to `#okatsune101` etc. No `og:image`. No `robots` / sitemap (acceptable MVP; indexability depends on host).

**Recommended fix:** Optional fragment links; add image later; robots after domain exists.

### W12 — Focus styles incomplete

**Severity:** MEDIUM  
**File:** `apps/site/public/css/styles.css`  
**Line:** 98–101 (links only); submit button ~288–297

**Problem:** `:focus-visible` is only on `a`. Native form controls/buttons have no custom visible focus. Skip-link uses `:focus` with `left: 0` but remains easy to miss.

**Recommended fix:** Shared `:focus-visible` outline on interactive controls.

### W13 — `site-config` references a missing analytics partial

**Severity:** LOW  
**File:** `apps/site/src/site-config.ts`  
**Line:** 14

**Problem:** Mentions `apps/site/public/partials/analytics.html`, which does not exist.

**Recommended fix:** Point at the HTML comments already in the built page, or add the empty partial later.

### W14 — Unrelated M2 database typing change in the same commit

**Severity:** LOW  
**File:** `packages/database/src/index.ts` (in `ed2b408`)

**Problem:** Commit includes a `Database` type refactor unrelated to the article. Not M3, but scope noise.

**Recommended fix:** Keep article commits isolated next time.

### W15 — Meta description length

**Severity:** LOW  
**File:** `apps/site/data/article.json`  
**Line:** 7

**Problem:** Description is ~178 characters (typical SERP truncation ~150–160). Title is ~73 characters (acceptable).

**Recommended fix:** Trim only if desired; not required for MVP.

### W16 — Schema `sku` is the model number

**Severity:** LOW  
**File:** `apps/site/scripts/build.mjs`  
**Line:** 195

**Problem:** `sku: "101"` / `"14"` etc. is not a retailer SKU. Harmless if no offers.

**Recommended fix:** Omit `sku` until a real SKU exists.

### W17 — Nested `<article>` elements

**Severity:** LOW  
**File:** `apps/site/scripts/build.mjs`  
**Line:** 127, 237

**Problem:** Product cards are `<article>` inside the page `<article>`. Valid HTML5, but noisy for some AT.

**Recommended fix:** Use `<section>` for product cards.

### W18 — Disclosure vs zero affiliate links

**Severity:** LOW  
**File:** built HTML ~359–360

**Problem:** “Some links on this page may be affiliate links” while CTAs are pending. Softened by “have not been verified.”

**Recommended fix:** Use “We may add affiliate links later…” until URLs exist.

---

## C. FAILURES

### F1 — Article source JSON is gitignored and not in `ed2b408`

**Severity:** CRITICAL  
**File:** `.gitignore`  
**Line:** 7 (`data/`)  
**Also:** `apps/site/data/products.json`, `sources.json`, `article.json` (present on disk; **not** in `git ls-files`)

**Problem:** Root ignore of `data/` was intended for PGlite storage, but it also ignores `apps/site/data/`. Commit `ed2b408` therefore shipped the builder **without** the evidence dataset. Fresh clone: `build.mjs` and `validate-data.test.ts` cannot read products/sources/article JSON.

**Recommended fix:** Exception, e.g. `!apps/site/data/` / `!apps/site/data/**`, then commit the JSON files. Do not track `dist/`.

### F2 — No `lint` script (reported because the audit required it)

**Severity:** LOW  
**File:** `package.json`  
**Line:** 16–22

**Problem:** `npm run lint` exits 1 (`Missing script: "lint"`). M2 explicitly deferred ESLint.

**Recommended fix:** Document N/A, or add a no-op/`eslint` later — **not required to ship this MVP**.

No other **CRITICAL** HTML/affiliate fabrication failures on the generated page.

---

## D. DATA CONFLICTS

### Product claim table

| product | claim | value shown / stored | source | confidence | status |
|---------|--------|----------------------|--------|------------|--------|
| Okatsune 101 | Hand size | Small / smaller hand (manufacturer positioning); notes 16–18.5 × 7–8.5 cm | `src-okatsune-europe-101` + `src-okatsune-uk-hand-guide` | high | manufacturer_claim |
| Okatsune 101 | Length | 180 mm | `src-okatsune-europe-101` | high | verified fact (as published) |
| Okatsune 101 | Weight | **approx. 177–180 g** (`value` 177, min 177, max 180) | Europe 177 g + UK shop 180 g | medium | **VERIFY** (not collapsed to one gram) |
| Okatsune 101 | Cut capacity | 25 mm | `src-okatsune-europe-101` | high | fact |
| FELCO 14 | Hand size | Small (S) | `src-felco-14` | high | fact |
| FELCO 14 | Length / weight / cut | 180 mm / 190 g / 18 mm | `src-felco-14` | high | fact |
| FELCO 14 | Independent use | Gardeners' World (comfort, stiff catch, thicker stems) | `src-gardeners-world-felco-14` | — | independent_test (theirs, not ours) |
| FELCO 14 | Price USD 74.71 | JSON only, not on page | “User research input — VERIFY” | — | **not current**; correctly hidden |
| Darlac DP930 | Hand size | Small hands / slim handles | `src-darlac-dp930` | high | manufacturer_claim |
| Darlac DP930 | Length / cut | 175 mm / 16 mm | manufacturer | high | fact |
| Darlac DP930 | Weight | **CONFLICT 146–178 g** (`value` still 146) | copy/PDF 146 vs WooCommerce 178 | **low** | **CONFLICT / VERIFY** — correctly not collapsed on the page |
| FELCO 15 | Hand size / length / weight / cut | Small / 189 mm / 252.5 g / 18 mm | `src-felco-15` | high | fact (notes 252–254 g research range) |
| FELCO 15 | Force reduction | “up to 30%” | FELCO product page | — | **manufacturer_claim**; wording on page is correct |
| FELCO 15 | Price USD 96.21 | JSON only | VERIFY | — | hidden |
| FELCO 6 | Hand size | **Medium (M) — FELCO current classification** | `src-felco-6` | high | fact; editorial “small-to-medium” does **not** override Medium |
| FELCO 6 | Length / weight / cut | 195 mm / 219 g / 20 mm | `src-felco-6` | high | fact |
| FELCO 6 | Price USD 79.92 | JSON only | VERIFY | — | hidden |

**Open conflicts (do not treat as resolved):**

1. Darlac weight 146 g vs 178 g (and retailer scatter 145–170 g in notes).  
2. Okatsune 101 weight 177 g vs 180 g.  
3. FELCO 6: manufacturer Medium vs third-party “smaller hands” narratives — page handles this correctly in FAQ/comparison; `whyWeLikeIt` is weaker (W9).

---

## E. MANUAL VERIFICATION REQUIRED

1. **Visual QA** (mobile ~375px and desktop ~1280px): table horizontal scroll, skip-link, tool, CTAs.  
2. **Click every external source URL** (manufacturer + Gardeners' World + Sprout Authority + PDF). Not live-checked in this audit.  
3. **Re-weigh Darlac DP930** / re-read current Darlac DOM vs PDF.  
4. **Affiliate programs** and real URLs (HUMAN tasks M2.5-10).  
5. **Replace canonical** before deploy.  
6. **Confirm git tracking of `apps/site/data/`** after F1 is fixed.  
7. **Accessibility:** keyboard tab through form + skip link on a real browser.  
8. **Rich Results** after a real domain exists (no invented schema fields to “fix” first).

### Local preview (no extra infra required)

From repo root, after `npm run build:site` (or `npm run build`):

**Option A — open the file (simplest)**

```powershell
start apps\site\dist\best-pruning-shears-for-small-hands\index.html
```

Relative `../css/styles.css` and `../js/hand-size-tool.js` resolve correctly from that folder.

**Option B — static server (optional)**

```powershell
npx --yes serve apps/site/dist
```

Then open `/best-pruning-shears-for-small-hands/`.

Do **not** set the article subdirectory as the web root, or CSS/JS `../` paths will 404.

---

## F. RECOMMENDED FIXES (do not implement in this audit)

Priority order:

1. **CRITICAL:** Stop ignoring `apps/site/data/`; commit `products.json`, `sources.json`, `article.json`.  
2. **HIGH:** Stop letting `priority` fully override fit; avoid high-confidence recs with empty measurements.  
3. **HIGH:** Wire `affiliate-links.ts` (or one JSON file) into `build.mjs` before humans paste URLs.  
4. **MEDIUM:** Deduplicate TS vs browser engine; fix mixed palm/length branch; tone down Darlac 146 g / FELCO 6 “widespread” lines.  
5. **LOW:** Rename “Product reviews”; truncate ellipsis; focus rings; canonical at publish time.

---

## G. M3 ITEMS FOUND ACCIDENTALLY

**None implemented.**

Checked: no LLM client, no SERP/product/evidence agents, no scraping, no publish pipeline, no queues, no embeddings, no tracking IDs.

Placeholders only (allowed):

- `RecommendationRecord` / `recommendation-records.placeholder.json` — empty array, future metrics  
- Footer text “Built for future automated publishing integration” — documentation, not a publisher  
- Analytics comments with empty IDs  

`packages/database/src/index.ts` in the same commit is a typing tweak, not M3.

---

## 2. CSS validity (detail)

Inspected: `apps/site/public/css/styles.css` (copied to dist).

| Token of concern | Present? | Actual | Validity |
|------------------|----------|--------|----------|
| `42 rem` | No | `--max-width: 42rem;` line 13 | Valid |
| `1 rem` | No | `--space: 1rem;` line 14; many `Nrem` | Valid |
| `1 px` | No | `1px` e.g. line 53 | Valid |
| `-9999 px` | No | `left: -9999px;` line 40 | Valid |

No invalid declarations found. Minor: deprecated `clip:rect(...)` in inline visually-hidden CSS (HTML line 15) — valid, older technique.

---

## 3. HTML / site output (detail)

| Check | Result |
|-------|--------|
| doctype / lang | yes, `en-US` |
| H1 count | 1 |
| H2 | Quick answer, measure, tool, table, products, comparisons, methodology, FAQ, sources |
| H3 | Five products + two comparison titles |
| H4 | Features / why / limitations / sources under products (logical) |
| Fake testing language | Absent (`we tested` not found). Explicit “did not personally test” |
| Fake prices / ratings | Absent on page |
| Placeholder exposure | `YOUR-DOMAIN.example`, “M2.5 MVP”, “affiliate link pending” — intentional, not fake shops |
| Internal links | `#main` skip link only; product `id`s exist but unused |
| Nested article | valid, see W17 |

---

## 5. Hand-size engine (boundary log)

Deterministic: same inputs → same outputs (re-run of cases identical).

| Input | Recommended | Alt | Confidence | Note |
|-------|-------------|-----|------------|------|
| 15.9 / 7.5 | okatsune101 | darlacDp930 | low | Below length min |
| 16.0 / 7.0 | okatsune101 | felco14 | high | Lower inclusive bound |
| 18.5 / 8.5 | okatsune101 | felco14 | high | Upper inclusive bound |
| 18.6 / 8.0 | felco6 | felco14 | medium | “Slightly larger” band (≤20 cm) |
| 20.0 / 8.0 | felco6 | felco14 | medium | Top of slightly-larger |
| 21.0 / 8.0 | felco6 | felco14 | medium | Exceeds slightly-larger (>20); still FELCO 6 |
| 21.1 / 8.0 | felco6 | felco14 | medium | Same as 21.0 |
| missing / invalid (0, negative) | okatsune101 | felco14 | low | OK default |
| premium | felco14 | felco6 | high | Ignores measurements (W1) |
| rotating handle | felco15 | felco14 | high | Ignores measurements (W1) |
| max capacity | okatsune101 | felco6 | high | Ignores measurements (W1) |
| lightest | darlacDp930 | okatsune101 | medium | Ignores measurements (W1) |

Questionable: W1, W2, and recommending FELCO 6 for 21+ cm with copy about “small-to-medium” (may still be reasonable as “largest compact FELCO in set”).

Tests cover small, medium-ish, rotating, capacity, missing, 16/18.5 bounds, lightest, premium. They do **not** cover 15.9, 18.6, 21.x, or priority-with-empty-hands.

---

## 6–11. Affiliate / SEO / a11y / perf / security / scope

Covered in A–C. Affiliate safety **passes** for empty URLs. SEO is adequate MVP with placeholder canonical (W6). Performance is static and small. No secrets or tracking IDs in source. Scope: **no M3**.

---

## 12. Visual QA command

```powershell
cd C:\Users\MarcoNocentini\OneDrive\Documenti\Altro
npm run build:site
start apps\site\dist\best-pruning-shears-for-small-hands\index.html
```

---

**Audit stop.** No application fixes applied. No new commit created.
