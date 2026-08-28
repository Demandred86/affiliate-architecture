import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

const products = JSON.parse(readFileSync(join(dataDir, "products.json"), "utf8"));
const sources = JSON.parse(readFileSync(join(dataDir, "sources.json"), "utf8"));

describe("M2.5 product data validation", () => {
  it("includes exactly five products", () => {
    expect(products).toHaveLength(5);
    const ids = products.map((p: { id: string }) => p.id);
    expect(ids).toEqual(["okatsune101", "felco14", "darlacDp930", "felco15", "felco6"]);
  });

  it("references only known source ids", () => {
    const sourceIds = new Set(sources.map((s: { id: string }) => s.id));
    for (const product of products) {
      for (const sid of product.sources) {
        expect(sourceIds.has(sid)).toBe(true);
      }
    }
  });

  it("marks Darlac weight as conflict without collapsing values", () => {
    const darlac = products.find((p: { id: string }) => p.id === "darlacDp930");
    expect(darlac.weightG.status).toBe("conflict");
    expect(darlac.weightG.min).toBe(146);
    expect(darlac.weightG.max).toBe(178);
  });

  it("does not embed verified affiliate URLs", () => {
    for (const product of products) {
      for (const r of product.affiliate.retailers) {
        expect(r.url).not.toMatch(/^https?:\/\//);
      }
    }
  });

  it("keeps affiliate-links.json as the URL store with empty or https values", () => {
    const links = JSON.parse(
      readFileSync(join(dataDir, "affiliate-links.json"), "utf8"),
    ) as Record<string, { amazonUS: string; retailerUS: string }>;
    const ids = products.map((p: { id: string }) => p.id);
    expect(Object.keys(links).sort()).toEqual([...ids].sort());
    for (const entry of Object.values(links)) {
      for (const url of [entry.amazonUS, entry.retailerUS]) {
        if (url.trim()) {
          expect(url).toMatch(/^https:\/\//);
        }
      }
    }
  });

  it("uses real source URLs only", () => {
    for (const source of sources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.url).not.toContain("example.com");
    }
  });
});
