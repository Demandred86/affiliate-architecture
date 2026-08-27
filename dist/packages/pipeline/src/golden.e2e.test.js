import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTestDb, keywordMetrics, keywordScores, keywords, seed, } from "@ase/database";
import { parse } from "csv-parse/sync";
import { describe, expect, it } from "vitest";
import { defaultBudgetCaps, runPipeline } from "./index.js";
describe("golden M2 pipeline", () => {
    it("runs the actual 44-row CSV twice without duplicating canonical keywords", async () => {
        const testDb = await createTestDb();
        const outputDirectory = await mkdtemp(join(tmpdir(), "ase-m2-golden-"));
        try {
            await seed(testDb.db);
            const sourcePath = new URL("../../../docs/M1_TOP50_keyword_shortlist.csv", import.meta.url);
            const content = await readFile(sourcePath);
            const first = await runPipeline(testDb.db, {
                content,
                sourcePath: "docs/M1_TOP50_keyword_shortlist.csv",
                outputDirectory,
                budgetCaps: defaultBudgetCaps(),
            });
            expect(first.report.summary).toEqual({
                imported: 44,
                rejected: 0,
                duplicates: 0,
                analyzed: 10,
                clustered: 10,
                scored: 10,
                errors: [],
            });
            expect(first.report.keywords).toHaveLength(10);
            expect(first.report.total_estimated_cost_usd).toBe(0);
            expect(first.report.llm_calls).toBe(0);
            expect(first.report.keywords.every((row) => row.m1_hypothesis.metric_name === "M1_HYPOTHESIS_SCORE" &&
                row.m1_hypothesis.source_type === "HYPOTHESIS" &&
                row.provisional_opportunity_score.label ===
                    "PROVISIONAL_OPPORTUNITY_SCORE" &&
                row.provisional_opportunity_score.score_kind ===
                    "OPPORTUNITY_SCORE" &&
                row.provisional_opportunity_score.missing_inputs.includes("search_volume"))).toBe(true);
            expect(JSON.stringify(first.report)).not.toMatch(/"search_volume"\s*:\s*\d/);
            const json = JSON.parse(await readFile(first.artifacts.jsonPath, "utf8"));
            const csv = parse(await readFile(first.artifacts.csvPath), {
                columns: true,
            });
            const markdown = await readFile(first.artifacts.markdownPath, "utf8");
            expect(json.summary).toEqual(first.report.summary);
            expect(csv).toHaveLength(10);
            expect(csv.every((row) => row.m1_hypothesis_source_type === "HYPOTHESIS")).toBe(true);
            expect(markdown).toContain("PROVISIONAL_OPPORTUNITY_SCORE");
            expect(markdown).toContain("source_type=HYPOTHESIS");
            expect(markdown).toContain("No search volume, traffic, or live SERP data");
            const second = await runPipeline(testDb.db, {
                content,
                sourcePath: "docs/M1_TOP50_keyword_shortlist.csv",
                outputDirectory,
                budgetCaps: defaultBudgetCaps(),
            });
            expect(second.importResult.reused).toBe(true);
            expect(second.report.summary).toEqual(first.report.summary);
            expect(await testDb.db.select().from(keywords)).toHaveLength(44);
            expect(new Set((await testDb.db.select().from(keywords)).map((row) => row.canonicalHash)).size).toBe(44);
            expect(await testDb.db.select().from(keywordScores)).toHaveLength(10);
            expect((await testDb.db.select().from(keywordMetrics)).every((metric) => metric.sourceType === "HYPOTHESIS")).toBe(true);
        }
        finally {
            await testDb.close();
            await rm(outputDirectory, { recursive: true, force: true });
        }
    });
});
//# sourceMappingURL=golden.e2e.test.js.map