import { readFile } from "node:fs/promises";
import { createTestDb, importBatches, importRows, keywordMetrics, keywords, seed, } from "@ase/database";
import { describe, expect, it } from "vitest";
import { importM1Csv, M1_COLUMNS } from "./index.js";
describe("M1 CSV importer", () => {
    it("imports all 44 rows with batch and hypothesis provenance", async () => {
        const testDb = await createTestDb();
        try {
            await seed(testDb.db);
            const file = await readFile(new URL("../../../docs/M1_TOP50_keyword_shortlist.csv", import.meta.url));
            const result = await importM1Csv(testDb.db, {
                content: file,
                sourcePath: "docs/M1_TOP50_keyword_shortlist.csv",
                actor: "test",
            });
            expect(result).toMatchObject({
                rowCount: 44,
                acceptedCount: 44,
                rejectedCount: 0,
                duplicateCount: 0,
                status: "COMPLETE",
                reused: false,
            });
            expect(result.fileSha256).toMatch(/^[a-f0-9]{64}$/);
            expect(await testDb.db.select().from(keywords)).toHaveLength(44);
            expect(await testDb.db.select().from(importRows)).toHaveLength(44);
            const metrics = await testDb.db.select().from(keywordMetrics);
            expect(metrics).toHaveLength(88);
            expect(metrics.filter((metric) => ["M1_HYPOTHESIS_SCORE", "M1_HYPOTHESIS_SERP_LABEL"].includes(metric.metricName))).toHaveLength(88);
            expect(metrics.every((metric) => metric.sourceType === "HYPOTHESIS")).toBe(true);
            expect(metrics.some((metric) => metric.sourceType === "MEASURED")).toBe(false);
            const repeated = await importM1Csv(testDb.db, {
                content: file,
                sourcePath: "same-content.csv",
            });
            expect(repeated.reused).toBe(true);
            expect(await testDb.db.select().from(importBatches)).toHaveLength(1);
            expect(await testDb.db.select().from(keywords)).toHaveLength(44);
        }
        finally {
            await testDb.close();
        }
    });
    it("reports extra-column rows as rejected and the batch as partial", async () => {
        const testDb = await createTestDb();
        try {
            await seed(testDb.db);
            const header = M1_COLUMNS.join(",");
            const csv = `${header}\n1,Lawn & Garden,best rake for patios,75,Medium,reason,Y\n2,Lawn & Garden,best hoe for clay,74,Medium,reason,Y,EXTRA\n`;
            const result = await importM1Csv(testDb.db, {
                content: csv,
                sourcePath: "extra-column.csv",
            });
            expect(result).toMatchObject({
                rowCount: 2,
                acceptedCount: 1,
                rejectedCount: 1,
                status: "PARTIAL",
            });
            const rows = await testDb.db.select().from(importRows);
            expect(rows.find((row) => row.status === "REJECTED")?.rejectReason).toBe("EXPECTED_7_COLUMNS_GOT_8");
        }
        finally {
            await testDb.close();
        }
    });
    it("normalizes and canonical-hash deduplicates equivalent rows", async () => {
        const testDb = await createTestDb();
        try {
            await seed(testDb.db);
            const header = M1_COLUMNS.join(",");
            const csv = `${header}\n1,Lawn & Garden, Best  Rake For Patios ,75,Medium,reason,Y\n2,Lawn & Garden,best rake for patios,74,Medium,reason,Y\n`;
            const result = await importM1Csv(testDb.db, {
                content: csv,
                sourcePath: "duplicates.csv",
            });
            expect(result).toMatchObject({
                rowCount: 2,
                acceptedCount: 1,
                duplicateCount: 1,
                rejectedCount: 0,
                status: "COMPLETE",
            });
            expect(await testDb.db.select().from(keywords)).toHaveLength(1);
            const rows = await testDb.db.select().from(importRows);
            expect(rows.map((row) => row.status).sort()).toEqual([
                "ACCEPTED",
                "DUPLICATE",
            ]);
        }
        finally {
            await testDb.close();
        }
    });
    it("records malformed quoted CSV as a failed batch", async () => {
        const testDb = await createTestDb();
        try {
            await seed(testDb.db);
            const result = await importM1Csv(testDb.db, {
                content: `${M1_COLUMNS.join(",")}\n1,Lawn & Garden,"unterminated`,
                sourcePath: "malformed.csv",
            });
            expect(result).toMatchObject({
                rowCount: 0,
                status: "FAILED",
                reused: false,
            });
        }
        finally {
            await testDb.close();
        }
    });
});
//# sourceMappingURL=index.test.js.map