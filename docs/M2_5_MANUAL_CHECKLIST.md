# M2.5 Manual Checklist

Use this after `npm run build:site` to prepare the first article for real traffic.

---

## A. Local verification (30–45 min)

- [ ] Run `npm install` from repo root
- [ ] Run `npm test` — all tests green
- [ ] Run `npm run typecheck`
- [ ] Run `npm run build` (or `npm run build:site`)
- [ ] Open `apps/site/dist/best-pruning-shears-for-small-hands/index.html` in a browser
- [ ] **Mobile layout:** resize to ~375px width; table scrolls horizontally; text readable
- [ ] **Desktop layout:** check at 1280px; no broken layout
- [ ] Click every external source link — must reach real manufacturer/independent pages
- [ ] Confirm affiliate CTAs show **“affiliate link pending”** (not broken links)
- [ ] Test hand-size tool: small hands (17 / 7.5), medium (19 / 8.5), each priority option
- [ ] Confirm page does **not** say “we tested” or “our hands-on testing”

---

## B. Content & evidence review (45–60 min)

- [ ] Re-read Darlac DP930 weight — still CONFLICT; verify on current Darlac page before changing
- [ ] Re-read Okatsune 101 weight — 177 vs 180 g still VERIFY?
- [ ] Spot-check FELCO 14/15/6 specs on felco.com (US or EU)
- [ ] Confirm FELCO 15 “30% force reduction” is attributed to FELCO only
- [ ] Confirm FELCO 6 labeled Medium, not Small
- [ ] Optional: refresh Gardeners' World FELCO 14 review URL still live

---

## C. Affiliate setup (1–3 days including approval wait)

- [ ] Create Amazon Associates account (or approved retailer program)
- [ ] Confirm each product is eligible for your program/market
- [ ] Obtain real affiliate URLs for: Okatsune 101, FELCO 14, Darlac DP930, FELCO 15, FELCO 6
- [ ] Edit `apps/site/src/affiliate-links.ts` with verified URLs
- [ ] Mirror URLs in `apps/site/scripts/build.mjs` `affiliateLinks` object (or refactor to import shared config in a later task)
- [ ] Rebuild site; confirm CTAs are clickable and use `rel="nofollow sponsored"`
- [ ] Update affiliate disclosure text if relationships are confirmed

---

## D. Price & availability (30 min)

- [ ] Check current US/UK prices at manufacturer or major retailers
- [ ] Update `priceObservations` in `products.json` if you choose to display prices later
- [ ] **Do not** show stale prices on the live page without a “checked at” date

---

## E. Hosting & SEO (2–4 hours)

- [ ] Register domain
- [ ] Deploy `apps/site/dist/` to static host (Netlify, Cloudflare Pages, S3, etc.)
- [ ] Set canonical URL in `article.json` (replace `YOUR-DOMAIN.example`)
- [ ] Rebuild after canonical change
- [ ] Add Google Search Console property; submit sitemap/URL
- [ ] Add GA4 or privacy-compliant analytics in `site-config.ts` / HTML placeholder
- [ ] Validate structured data with Google Rich Results Test
- [ ] Request indexing for `/best-pruning-shears-for-small-hands/`

---

## F. Post-publish monitoring (ongoing)

- [ ] Week 1: Check Search Console for crawl/index status
- [ ] Week 2–4: Note impressions/clicks for primary keyword
- [ ] Track affiliate clicks (once links live)
- [ ] Document learnings for M3 backlog (what evidence was wrong, what converted)

---

## Stop condition

When A–E are done for this **one** page, **stop**. Do not start M3 automation until you have traffic/conversion signal worth scaling.
