# M2.5 deploy preparation report

Scope: publish-ready **static** first article. No engine redesign, no AI, no M3.

**Replace `SITE_URL` before going live.** The build currently uses the placeholder `https://example.com`.

---

## Files changed

| Path | Change |
|------|--------|
| `apps/site/data/affiliate-links.json` | Single source of truth for affiliate URLs (all empty) |
| `apps/site/src/affiliate-links.ts` | Loads that JSON; no duplicate URL map |
| `apps/site/scripts/build.mjs` | Reads affiliate JSON; `SITE_URL`; writes robots/sitemap; canonical + `og:url` from origin |
| `apps/site/src/site-config.ts` | Documents `SITE_URL` / `https://example.com`; no tracking IDs |
| `apps/site/src/types.ts` | Note that live canonical comes from `SITE_URL` |
| `apps/site/data/article.json` | Default canonical placeholder uses `https://example.com` (overridden at build) |
| `apps/site/src/validate-data.test.ts` | Asserts affiliate JSON keys and empty-or-https URLs |
| `apps/site/src/build-seo.test.ts` | Builds site and checks robots, sitemap, OG, disabled CTAs |
| `.env.example` | Safe `SITE_URL=https://example.com` placeholder |
| `docs/M2_5_DEPLOYMENT.md` | Human deploy steps |
| `docs/M2_5_LAUNCH_CHECKLIST.md` | CURSOR / HUMAN / SHARED checkboxes |
| `docs/M2_5_MANUAL_CHECKLIST.md` | Affiliate + `SITE_URL` pointers aligned with this work |
| `docs/M2_5_DEPLOY_REPORT.md` | This report |

Generated output (gitignored, **not** to be committed): `apps/site/dist/`, root `dist/` from `tsc`.

---

## Build status

**Pass.**

```bash
npm run build
```

Site workspace build also ran as part of that command (`npm run build --workspace=@ase/site`).

Log:

```
Site built: ...\apps\site\dist\best-pruning-shears-for-small-hands\index.html
SITE_URL: https://example.com
Canonical: https://example.com/best-pruning-shears-for-small-hands/
```

---

## Tests

**Pass.** `npm test` — 13 files, 44 tests.

**Pass.** `npm run typecheck`.

---

## SEO status

| Item | Status |
|------|--------|
| Configurable origin | `SITE_URL` (env or repo-root `.env`; default `https://example.com`) |
| `robots.txt` | Generated at `apps/site/dist/robots.txt` |
| `sitemap.xml` | Generated at `apps/site/dist/sitemap.xml` (one article URL) |
| Canonical | `SITE_URL` + `/best-pruning-shears-for-small-hands/` |
| `og:title` | Present |
| `og:description` | Present |
| `og:type` | `article` |
| `og:url` | Same as canonical |
| `og:image` | Omitted (no image asset) |

---

## Affiliate configuration status

- **Source of truth:** `apps/site/data/affiliate-links.json` (used by `build.mjs` and `affiliate-links.ts`).
- **URLs:** all empty. No Amazon URLs invented. No Amazon APIs.
- **Render:** disabled “Check current price — affiliate link pending”.
- Adding real `https://` URLs later and rebuilding is supported.

---

## Security / secrets

- `.gitignore` ignores `.env`, `.env.*` (with `!.env.example`), and `dist/`.
- `.env.example` has budget/log placeholders plus `SITE_URL=https://example.com` only.
- No API keys or credentials added.

---

## Performance

Page remains static HTML + one small hand-size script. No analytics package, no tracking SDK, no extra runtime dependencies.

---

## Exact deployment command

From repository root, after setting a real `SITE_URL`:

```bash
npm run build:site
```

Full gate used for this report:

```bash
npm test
npm run typecheck
npm run build
```

---

## Exact output directory

`apps/site/dist/`

Upload that directory’s contents. Article path: `/best-pruning-shears-for-small-hands/`.

---

## Remaining human actions

1. Choose a domain.
2. Set `SITE_URL` (do not ship `https://example.com`).
3. Rebuild and deploy `apps/site/dist/`.
4. Verify page, `robots.txt`, `sitemap.xml`, canonical.
5. Add real affiliate URLs when approved; rebuild; redeploy.
6. Google Search Console: property, sitemap submit, URL inspect.

See `docs/M2_5_DEPLOYMENT.md` and `docs/M2_5_LAUNCH_CHECKLIST.md`.

**This preparation does not publish the site.**

---

## Scope confirmation

| Item | Count |
|------|--------|
| LLM calls | **0** |
| Paid APIs | **0** |
| New agents | **0** |
| M3 implementation | **0** |
| Automatic publishing | **0** |
| Automatic affiliate discovery | **0** |
| Price scraping | **0** |
| Backlink automation | **0** |
| Hand-size engine Fix #2 | **0** (intentionally skipped) |
