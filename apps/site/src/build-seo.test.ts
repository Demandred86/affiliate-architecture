import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, "..");
const distDir = join(siteRoot, "dist");
const articlePath = "/best-pruning-shears-for-small-hands/";

describe("M2.5 production SEO build", () => {
  it("emits robots.txt, sitemap.xml, canonical, and Open Graph from SITE_URL", () => {
    const siteUrl = "https://example.com";
    const result = spawnSync(process.execPath, ["scripts/build.mjs"], {
      cwd: siteRoot,
      env: { ...process.env, SITE_URL: siteUrl },
      encoding: "utf8",
    });
    expect(result.status).toBe(0);

    const html = readFileSync(join(distDir, "best-pruning-shears-for-small-hands", "index.html"), "utf8");
    const robots = readFileSync(join(distDir, "robots.txt"), "utf8");
    const sitemap = readFileSync(join(distDir, "sitemap.xml"), "utf8");
    const canonical = `${siteUrl}${articlePath}`;

    expect(html).toContain(`<link rel="canonical" href="${canonical}">`);
    expect(html).toContain('<meta property="og:type" content="article">');
    expect(html).toContain('<meta property="og:title"');
    expect(html).toContain('<meta property="og:description"');
    expect(html).toContain(`<meta property="og:url" content="${canonical}">`);
    expect(html).not.toContain("og:image");
    expect(html).toContain("Check current price — affiliate link pending");
    expect(html).not.toContain('rel="nofollow sponsored');

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);

    expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(sitemap).toContain(`<loc>${canonical}</loc>`);
  });
});
