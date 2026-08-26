import { readFile } from "node:fs/promises";
import {
  agentRuns,
  createTestDb,
  keywordAnalyses,
  keywordClusterMembers,
  keywordClusters,
  keywords,
  seed,
} from "@ase/database";
import { importM1Csv } from "@ase/importer";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { analyzeKeyword, analyzeNicheKeywords } from "./index.js";

const caps = {
  maxCostPerRunUsd: 1,
  dailyBudgetUsd: 1,
  maxProjectBudgetUsd: 5,
};

describe("deterministic keyword analysis", () => {
  it("supports both approved grammars", () => {
    expect(analyzeKeyword("best garden tools for raised beds")).toMatchObject({
      patternType: "BEST_X_FOR_Y",
      productText: "garden tools",
      qualifierText: "raised beds",
      path: "DETERMINISTIC",
    });
    expect(analyzeKeyword("best lightweight garden tools")).toMatchObject({
      patternType: "BEST_ATTRIBUTE_X",
      productText: "garden tools",
      qualifierText: "lightweight",
      constraintText: "lightweight",
      path: "DETERMINISTIC",
    });
  });

  it("analyzes all gardening keywords without an LLM and groups tomato support", async () => {
    const testDb = await createTestDb();
    try {
      await seed(testDb.db);
      const file = await readFile(
        new URL("../../../docs/M1_TOP50_keyword_shortlist.csv", import.meta.url),
      );
      await importM1Csv(testDb.db, { content: file, sourcePath: "m1.csv" });
      const result = await analyzeNicheKeywords(
        testDb.db,
        "problem-solving-gardening",
        caps,
      );
      expect(result).toEqual({ analyzedCount: 10, cacheHits: 0 });

      const analyses = await testDb.db.select().from(keywordAnalyses);
      expect(analyses).toHaveLength(10);
      expect(analyses.every((analysis) => analysis.path === "DETERMINISTIC")).toBe(
        true,
      );
      expect(
        analyses.some(
          (analysis) => analysis.patternType === "BEST_ATTRIBUTE_X",
        ),
      ).toBe(true);
      expect(JSON.stringify(analyses)).not.toContain("search_volume");

      const [tomatoCluster] = await testDb.db
        .select()
        .from(keywordClusters)
        .where(eq(keywordClusters.slug, "tomato-support"));
      expect(tomatoCluster).toBeDefined();
      const members = tomatoCluster
        ? await testDb.db
            .select({ text: keywords.canonicalText })
            .from(keywordClusterMembers)
            .innerJoin(
              keywords,
              eq(keywords.id, keywordClusterMembers.keywordId),
            )
            .where(eq(keywordClusterMembers.clusterId, tomatoCluster.id))
        : [];
      expect(members.map((member) => member.text).sort()).toEqual([
        "best plant support for tomatoes",
        "best trellis for tomatoes",
      ]);

      const runs = await testDb.db.select().from(agentRuns);
      expect(runs).toHaveLength(10);
      expect(
        runs.every(
          (run) =>
            run.model === "deterministic" &&
            run.provider === "none" &&
            run.inputTokens === 0 &&
            run.outputTokens === 0,
        ),
      ).toBe(true);

      const repeated = await analyzeNicheKeywords(
        testDb.db,
        "problem-solving-gardening",
        caps,
      );
      expect(repeated).toEqual({ analyzedCount: 10, cacheHits: 10 });
    } finally {
      await testDb.close();
    }
  });
});
