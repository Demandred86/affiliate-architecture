# M2.5 deployment

Publish **one** static article and measure organic traffic and affiliate clicks.

This repository does **not** assume a specific host. Upload the static output to any static file host (object storage, Pages, Netlify, nginx, etc.).

**You must replace `SITE_URL` before going live.** The default `https://example.com` is a placeholder, not a real site.

Do not commit `apps/site/dist/` or a filled `.env`.

---

## 1. Choose a domain

Pick the public origin you will actually serve, including `https://`, with **no trailing slash**.

Example shape: `https://your-domain.tld`

Point DNS at whatever host you use. This project does not register domains or configure DNS.

---

## 2. Configure `SITE_URL`

1. Copy `.env.example` to `.env` (`.env` is gitignored).
2. Set:

```env
SITE_URL=https://your-domain.tld
```

Use your real origin. Do not leave `https://example.com`.

You can also pass the variable for a single build without editing `.env`:

```bash
# Windows PowerShell
$env:SITE_URL="https://your-domain.tld"; npm run build:site
```

```bash
# macOS / Linux
SITE_URL=https://your-domain.tld npm run build:site
```

The build reads `SITE_URL` from the environment, then from repo-root `.env`, then falls back to `https://example.com`.

Canonical, Open Graph `og:url`, `robots.txt` sitemap line, and `sitemap.xml` are all derived from this value plus `/best-pruning-shears-for-small-hands/`.

---

## 3. Build the site

From the repository root:

```bash
npm test
npm run typecheck
npm run build
```

Site-only (faster, same static output):

```bash
npm run build:site
```

Exact output directory:

`apps/site/dist/`

Article URL path:

`/best-pruning-shears-for-small-hands/`

Generated SEO files (not source-controlled):

- `apps/site/dist/robots.txt`
- `apps/site/dist/sitemap.xml`
- `apps/site/dist/best-pruning-shears-for-small-hands/index.html`

---

## 4. Deploy the static files

Upload **the contents** of `apps/site/dist/` so that:

- `https://your-domain.tld/best-pruning-shears-for-small-hands/` serves `index.html`
- `https://your-domain.tld/robots.txt` is reachable
- `https://your-domain.tld/sitemap.xml` is reachable
- `https://your-domain.tld/css/styles.css` and `https://your-domain.tld/js/hand-size-tool.js` load

Enable HTTPS on the host. There is no application server and no build-time publish step in this repo.

---

## 5. Verify the page

Open:

`https://your-domain.tld/best-pruning-shears-for-small-hands/`

Check title, layout, source links, and the hand-size form. Affiliate buttons should stay disabled until you add real URLs (step 9).

---

## 6. Verify `robots.txt`

Open `https://your-domain.tld/robots.txt`.

Expect `User-agent: *`, `Allow: /`, and `Sitemap: https://your-domain.tld/sitemap.xml`.

---

## 7. Verify `sitemap.xml`

Open `https://your-domain.tld/sitemap.xml`.

Expect a single `<loc>` equal to `https://your-domain.tld/best-pruning-shears-for-small-hands/`.

---

## 8. Verify canonical

View source on the article. The canonical link and `og:url` must match:

`https://your-domain.tld/best-pruning-shears-for-small-hands/`

There is no `og:image` (no image asset ships with this MVP).

---

## 9. Add real affiliate URLs

Single source of truth: `apps/site/data/affiliate-links.json`.

Leave strings empty until you have approved program URLs. Empty values render **Check current price — affiliate link pending** (not a broken link).

When you have real URLs, paste them into `amazonUS` and/or `retailerUS` for each product id, rebuild (`npm run build:site`), and redeploy `apps/site/dist/`. Do not invent Amazon URLs. Do not add Amazon APIs.

---

## 10. Configure Google Search Console

1. Add a URL-prefix or domain property for your real origin.
2. Complete Google’s verification (DNS or HTML file on the host). This repo does not embed a verification meta tag.

No analytics SDK is bundled.

---

## 11. Submit sitemap

In Search Console: Sitemaps → submit `https://your-domain.tld/sitemap.xml`.

---

## 12. Inspect the page in Search Console

Use URL Inspection on `https://your-domain.tld/best-pruning-shears-for-small-hands/`. Request indexing if the live HTML matches the build (canonical, robots, sitemap).

Then **stop**. Do not start M3 or automatic publishing from this milestone.
