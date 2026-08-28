import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, "..");
const dataDir = join(siteRoot, "data");
const publicDir = join(siteRoot, "public");
const distDir = join(siteRoot, "dist");

function applyDotEnv(filePath) {
  try {
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional; SITE_URL falls back to https://example.com
  }
}

applyDotEnv(join(siteRoot, "..", "..", ".env"));

const products = JSON.parse(readFileSync(join(dataDir, "products.json"), "utf8"));
const sources = JSON.parse(readFileSync(join(dataDir, "sources.json"), "utf8"));
const article = JSON.parse(readFileSync(join(dataDir, "article.json"), "utf8"));
const affiliateLinks = JSON.parse(readFileSync(join(dataDir, "affiliate-links.json"), "utf8"));

function resolveSiteUrl() {
  const raw = (process.env.SITE_URL ?? "https://example.com").trim();
  return (raw || "https://example.com").replace(/\/+$/, "");
}

const siteUrl = resolveSiteUrl();
const articlePath = `/${article.slug}/`;
const canonicalUrl = `${siteUrl}${articlePath}`;

const affiliateDisclosure =
  "Some links on this page may be affiliate links. If you buy through them, we may earn a commission at no additional cost to you. Affiliate relationships have not been verified for this MVP page.";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatWeight(p) {
  const w = p.weightG;
  if (w.status === "conflict" && w.min != null && w.max != null) {
    return `CONFLICT: ${w.min}–${w.max} g (VERIFY)`;
  }
  if (w.status === "verify" && w.min != null && w.max != null && w.min !== w.max) {
    return `approx. ${w.min}–${w.max} g`;
  }
  return `${w.value} g`;
}

function sourceById(id) {
  return sources.find((s) => s.id === id);
}

function isManufacturerProductPage(source) {
  if (!source?.url || source.sourceType !== "manufacturer") return false;
  if (/\.pdf(\?|#|$)/i.test(source.url)) return false;
  if (/\/blogs\//i.test(source.url)) return false;
  return true;
}

function verifiedOfferUrl(product) {
  const links = affiliateLinks[product.id];
  const affiliateUrl = (links?.amazonUS || "").trim() || (links?.retailerUS || "").trim();
  if (affiliateUrl) return affiliateUrl;

  for (const sid of product.sources) {
    const source = sourceById(sid);
    if (isManufacturerProductPage(source)) return source.url;
  }
  return undefined;
}

function buildProductOffer(product) {
  // Google requires offers, review, or aggregateRating on Product.
  // No verified current price, currency, or availability exists in the dataset
  // (priceObservations are explicitly VERIFY / not current). Omit those fields.
  const offer = { "@type": "Offer" };
  const url = verifiedOfferUrl(product);
  if (url) offer.url = url;
  return offer;
}

function renderCta(productId) {
  const links = affiliateLinks[productId];
  const url = links?.amazonUS?.trim() || links?.retailerUS?.trim();
  if (url) {
    return `<p class="cta"><a href="${escapeHtml(url)}" rel="nofollow sponsored noopener" target="_blank">Check current price</a></p>`;
  }
  return `<p class="cta"><span class="cta-disabled" aria-disabled="true">Check current price — affiliate link pending</span></p>`;
}

function renderQuickAnswers() {
  return article.quickAnswers
    .map((qa) => {
      const product = products.find((p) => p.id === qa.productId);
      return `<li><strong>${escapeHtml(qa.label)} (editorial):</strong> ${escapeHtml(product?.name ?? qa.productId)}</li>`;
    })
    .join("\n");
}

function renderComparisonTable() {
  const rows = products
    .map((p) => {
      const keyFeature = p.keyFeatures[0] ?? "—";
      return `<tr>
        <th scope="row">${escapeHtml(p.name)}</th>
        <td>${escapeHtml(p.handSize.value)}</td>
        <td>${p.lengthMm.value} mm</td>
        <td>${escapeHtml(formatWeight(p))}</td>
        <td>${p.cuttingCapacityMm.value} mm</td>
        <td>${escapeHtml(keyFeature)}</td>
        <td>${escapeHtml(p.bestFor.slice(0, 80))}…</td>
        <td>${escapeHtml(p.evidenceConfidence)}</td>
      </tr>`;
    })
    .join("\n");

  return `<div class="comparison-table-wrap">
    <table class="comparison">
      <caption class="visually-hidden">Pruning shears comparison for small hands</caption>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Hand-size fit</th>
          <th scope="col">Length</th>
          <th scope="col">Weight</th>
          <th scope="col">Cut capacity</th>
          <th scope="col">Key feature</th>
          <th scope="col">Best for</th>
          <th scope="col">Evidence</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function renderProductCard(p) {
  const srcLinks = p.sources
    .map((sid) => {
      const s = sourceById(sid);
      if (!s) return `<li>${escapeHtml(sid)}</li>`;
      return `<li><a href="${escapeHtml(s.url)}" rel="noopener noreferrer">${escapeHtml(s.name)}</a> (${escapeHtml(s.sourceType)}, checked ${escapeHtml(s.checkedAt)})</li>`;
    })
    .join("\n");

  const limitations = p.limitations.map((l) => `<li>${escapeHtml(l)}</li>`).join("\n");
  const why = p.whyWeLikeIt.map((w) => `<li>${escapeHtml(w)}</li>`).join("\n");
  const features = p.keyFeatures.map((f) => `<li>${escapeHtml(f)}</li>`).join("\n");
  const editorialNotes = (p.editorialNotes ?? [])
    .map((n) => `<p class="editorial-note">${escapeHtml(n)}</p>`)
    .join("\n");

  const weightHtml =
    p.weightG.status === "conflict"
      ? `<span class="conflict">${escapeHtml(formatWeight(p))}</span>`
      : p.weightG.status === "verify"
        ? `<span class="verify">${escapeHtml(formatWeight(p))}</span>`
        : escapeHtml(formatWeight(p));

  return `<article class="product-card" id="${escapeHtml(p.id)}">
    <span class="label">${escapeHtml(p.recommendationLabel)}</span>
    <h3>${escapeHtml(p.name)}</h3>
    <p>${escapeHtml(p.bestFor)}</p>
    <dl class="spec-grid">
      <dt>Hand size</dt><dd>${escapeHtml(p.handSize.value)}</dd>
      <dt>Length</dt><dd>${p.lengthMm.value} mm</dd>
      <dt>Weight</dt><dd>${weightHtml}</dd>
      <dt>Cutting capacity</dt><dd>${p.cuttingCapacityMm.value} mm</dd>
      <dt>Mechanism</dt><dd>${escapeHtml(p.mechanism)}</dd>
      ${p.dexterity ? `<dt>Dexterity</dt><dd>${escapeHtml(p.dexterity)}</dd>` : ""}
    </dl>
    <h4>Key features</h4>
    <ul>${features}</ul>
    <h4>Why we recommend it (editorial)</h4>
    <ul>${why}</ul>
    <h4>Limitations</h4>
    <ul>${limitations}</ul>
    ${editorialNotes}
    <p><strong>Who should buy:</strong> ${escapeHtml(p.whoShouldBuy)}</p>
    <p><strong>Who should skip:</strong> ${escapeHtml(p.whoShouldSkip)}</p>
    <h4>Sources</h4>
    <ul class="sources-list">${srcLinks}</ul>
    ${renderCta(p.id)}
  </article>`;
}

function renderComparisons() {
  return article.comparisons
    .map(
      (c) =>
        `<section id="${escapeHtml(c.id)}"><h3>${escapeHtml(c.title)}</h3>${c.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n")}</section>`,
    )
    .join("\n");
}

function renderFaq() {
  return article.faq
    .map(
      (f) =>
        `<details><summary>${escapeHtml(f.question)}</summary><p>${escapeHtml(f.answer)}</p></details>`,
    )
    .join("\n");
}

function renderSourcesSection() {
  return sources
    .map(
      (s) =>
        `<li id="${escapeHtml(s.id)}"><strong>${escapeHtml(s.name)}</strong> — ${escapeHtml(s.sourceType)}. Checked ${escapeHtml(s.checkedAt)}. Claims: ${escapeHtml(s.claimsSupported.join("; "))}. <a href="${escapeHtml(s.url)}" rel="noopener noreferrer">${escapeHtml(s.url)}</a></li>`,
    )
    .join("\n");
}

function buildStructuredData() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: article.h1,
    description: article.metaDescription,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        brand: { "@type": "Brand", name: p.brand },
        description: p.bestFor,
        sku: p.model,
        offers: buildProductOffer(p),
      },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.h1,
    description: article.metaDescription,
    about: article.primaryKeyword,
  };

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [itemList, articleSchema],
  });
}

const html = `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.seoTitle)}</title>
  <meta name="description" content="${escapeHtml(article.metaDescription)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(article.openGraph.title)}">
  <meta property="og:description" content="${escapeHtml(article.openGraph.description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <!-- Analytics placeholder: insert Google Search Console verification / GA4 when ready -->
  <link rel="stylesheet" href="../css/styles.css">
  <style>.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>
  <script type="application/ld+json">${buildStructuredData()}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <main id="main">
    <article>
      <h1>${escapeHtml(article.h1)}</h1>
      <p>If you have <strong>small hands</strong>, standard pruning shears can feel oversized—hard to open fully, awkward to lock, and tiring over a long session. <strong>Fit matters</strong> as much as blade quality. So do <strong>weight</strong> (fatigue) and <strong>cutting capacity</strong> (what you can actually cut without straining).</p>
      <p>We compared five models using <strong>manufacturer specifications</strong>, <strong>independent publications</strong> where available, and retailer listings for context. We did <strong>not</strong> personally test these products; recommendations below are <strong>editorial</strong>, based on published evidence.</p>

      <section class="quick-answer" aria-labelledby="quick-answer-heading">
        <h2 id="quick-answer-heading">Quick answer (editorial recommendations)</h2>
        <p class="editorial-note">These are our editorial picks based on evidence—not manufacturer rankings or test winners.</p>
        <ul>${renderQuickAnswers()}</ul>
      </section>

      <section aria-labelledby="measure-heading">
        <h2 id="measure-heading">First, measure your hand</h2>
        <p>Manufacturers use different sizing systems. Okatsune publishes one guideline for model 101:</p>
        <ol>
          <li><strong>Hand length:</strong> tip of middle finger to wrist crease (cm).</li>
          <li><strong>Palm width:</strong> across the widest part of the palm, excluding thumb (cm).</li>
        </ol>
        <p>Okatsune suggests model <strong>101</strong> for roughly <strong>16–18.5 cm</strong> hand length and <strong>7–8.5 cm</strong> palm width (<a href="https://www.okatsune.co.uk/blogs/news/how-to-choose-the-right-size-secateurs-for-your-hands" rel="noopener noreferrer">Okatsune sizing guide</a>). This is a <strong>manufacturer guideline</strong>, not a universal medical or ergonomic standard—comfort is personal.</p>
        <p>FELCO publishes a downloadable hand-sizing chart for its models; the FELCO 14 is labeled <strong>Small</strong>, the FELCO 6 <strong>Medium</strong> on current product pages.</p>
      </section>

      <section class="hand-tool" aria-labelledby="tool-heading">
        <h2 id="tool-heading">Hand-size decision tool</h2>
        <p class="editorial-note">Deterministic editorial guide only—not medical advice.</p>
        <form id="hand-size-form">
          <label for="hand-length">Hand length (cm)</label>
          <input type="number" id="hand-length" name="hand-length" min="10" max="30" step="0.1" inputmode="decimal" placeholder="e.g. 17">
          <label for="palm-width">Palm width (cm)</label>
          <input type="number" id="palm-width" name="palm-width" min="5" max="15" step="0.1" inputmode="decimal" placeholder="e.g. 7.5">
          <label for="priority">Priority (optional)</label>
          <select id="priority" name="priority">
            <option value="">Balanced fit</option>
            <option value="lightest_weight">Lightest weight</option>
            <option value="maximum_cutting_capacity">Maximum cutting capacity</option>
            <option value="premium_serviceability">Premium / serviceability</option>
            <option value="ergonomic_handle">Ergonomic / rotating handle</option>
          </select>
          <button type="submit">Get recommendation</button>
        </form>
        <div id="hand-tool-result" class="hand-tool-result" aria-live="polite"></div>
      </section>

      <section aria-labelledby="comparison-heading">
        <h2 id="comparison-heading">Comparison table</h2>
        ${renderComparisonTable()}
      </section>

      <section aria-labelledby="products-heading">
        <h2 id="products-heading">Product reviews</h2>
        ${products.map(renderProductCard).join("\n")}
      </section>

      <section aria-labelledby="key-comparisons-heading">
        <h2 id="key-comparisons-heading">Key comparisons</h2>
        ${renderComparisons()}
      </section>

      <section aria-labelledby="methodology-heading">
        <h2 id="methodology-heading">How we evaluated these pruning shears</h2>
        <ul>
          <li><strong>Manufacturer specifications</strong> (Level 1): dimensions, weight, cutting capacity, hand-size labels, warranty claims.</li>
          <li><strong>Independent tests</strong> (Level 2): e.g. Gardeners' World on FELCO 14—cited as independent assessment, not our testing.</li>
          <li><strong>Retailer listings</strong> (Level 3): availability context only; prices treated as time-sensitive and not shown as current unless verified.</li>
          <li><strong>User reviews</strong> (Level 4): not used here to prove technical specifications.</li>
        </ul>
        <p>Where sources <strong>conflict</strong>—notably Darlac DP930 weight—we label <span class="conflict">CONFLICT</span> or <span class="verify">VERIFY</span> rather than pick a single number. Recommendations weigh fit, weight, cutting capacity, mechanism, serviceability, and evidence quality.</p>
        <p><strong>We did not hands-on test</strong> these shears for this MVP page.</p>
      </section>

      <section class="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">FAQ</h2>
        ${renderFaq()}
      </section>

      <section aria-labelledby="sources-heading">
        <h2 id="sources-heading">Sources &amp; evidence</h2>
        <ul class="sources-list">${renderSourcesSection()}</ul>
      </section>

      <aside class="disclosure" aria-label="Affiliate disclosure">
        <p>${escapeHtml(affiliateDisclosure)}</p>
      </aside>
    </article>
  </main>
  <footer class="site-footer">
    <p>M2.5 first-article MVP · Static data only · Built for future automated publishing integration</p>
    <!-- Google Analytics / Search Console: configure in apps/site/src/site-config.ts when ready -->
  </footer>
  <script src="../js/hand-size-tool.js" defer></script>
</body>
</html>`;

mkdirSync(join(distDir, "best-pruning-shears-for-small-hands"), { recursive: true });
mkdirSync(join(distDir, "css"), { recursive: true });
mkdirSync(join(distDir, "js"), { recursive: true });

writeFileSync(join(distDir, "best-pruning-shears-for-small-hands", "index.html"), html, "utf8");
cpSync(join(publicDir, "css", "styles.css"), join(distDir, "css", "styles.css"));
cpSync(join(publicDir, "js", "hand-size-tool.js"), join(distDir, "js", "hand-size-tool.js"));
mkdirSync(join(distDir, "data"), { recursive: true });
cpSync(join(dataDir, "products.json"), join(distDir, "data", "products.json"));
cpSync(join(dataDir, "sources.json"), join(distDir, "data", "sources.json"));
cpSync(join(dataDir, "article.json"), join(distDir, "data", "article.json"));

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeHtml(canonicalUrl)}</loc>
  </url>
</urlset>
`;

writeFileSync(join(distDir, "robots.txt"), robotsTxt, "utf8");
writeFileSync(join(distDir, "sitemap.xml"), sitemapXml, "utf8");

console.log("Site built:", join(distDir, "best-pruning-shears-for-small-hands", "index.html"));
console.log("SITE_URL:", siteUrl);
console.log("Canonical:", canonicalUrl);
