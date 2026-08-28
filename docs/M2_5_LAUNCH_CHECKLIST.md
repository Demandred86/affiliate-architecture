# M2.5 launch checklist

One article. Measure organic traffic and affiliate clicks. No M3.

Times are estimates for a single operator.

---

## CURSOR

- [ ] Keep affiliate URLs in `apps/site/data/affiliate-links.json` only (~5 min review)
- [ ] Confirm empty URLs render disabled CTAs (~5 min)
- [ ] Confirm production static build (`npm run build` / `npm run build:site`) (~10 min)
- [ ] Confirm `robots.txt` and `sitemap.xml` are generated from `SITE_URL` (~5 min)
- [ ] Confirm canonical and Open Graph (`og:title`, `og:description`, `og:type`, `og:url`) (~5 min)
- [ ] Confirm no `og:image` unless a real image exists (~2 min)
- [ ] Confirm `.env` is gitignored and `.env.example` has only placeholders (~5 min)
- [ ] Confirm no analytics / tracking SDK in the page (~2 min)
- [ ] Write deployment + launch docs (`docs/M2_5_DEPLOYMENT.md`, this file, report) (~20 min)

**CURSOR subtotal:** ~1 hour

---

## HUMAN

- [ ] Choose and register a real domain (~15–60 min + DNS wait)
- [ ] Copy `.env.example` → `.env` and set `SITE_URL` to that origin (~5 min)
- [ ] Rebuild after `SITE_URL` is set (~5 min)
- [ ] Deploy contents of `apps/site/dist/` to a static host (~15–45 min)
- [ ] Verify the live article URL in a browser (~10 min)
- [ ] Verify live `robots.txt` (~5 min)
- [ ] Verify live `sitemap.xml` (~5 min)
- [ ] Verify live canonical and `og:url` (~5 min)
- [ ] Obtain approved affiliate URLs; paste into `affiliate-links.json`; rebuild; redeploy (~30 min after program approval; approval itself may take days)
- [ ] Add the property in Google Search Console and complete verification (~15–30 min)
- [ ] Submit the sitemap in Search Console (~5 min)
- [ ] Inspect the article URL in Search Console and request indexing (~10 min)

**HUMAN subtotal:** ~2–3 hours of active work (plus domain DNS and affiliate-program wait)

---

## SHARED

- [ ] Run `npm test`, `npm run typecheck`, `npm run build` before the first deploy (~10 min)
- [ ] Confirm the live origin matches `SITE_URL` (no leftover `example.com`) (~5 min)
- [ ] Confirm affiliate CTAs: pending until URLs exist; `rel="nofollow sponsored"` after URLs exist (~10 min)
- [ ] Spot-check manufacturer/independent source links still resolve (~15 min)
- [ ] After indexing: watch Search Console for crawl/index errors (~15 min in week 1, then weekly)

**SHARED subtotal:** ~1 hour around launch, then light weekly checks

---

## Stop

When the page is live, Search Console has the sitemap, and affiliate URLs are either pending or real: **stop**. Do not add AI, paid APIs, auto-publish, or M3 work from this checklist.
