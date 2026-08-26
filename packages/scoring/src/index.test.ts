import { readFile } from "node:fs/promises";
import {
  createTestDb,
  keywordMetrics,
  keywordScores,
  seed,
} from "@ase/database";
import { importM1Csv } from "@ase/importer";
import { analyzeNicheKeywords } from "@ase/keyword-agent";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  calculateOpportunityScore,
  scoreNicheKeywords,
  type ScoringInput,
} from "./index.js";

const caps = {
  maxCostPerRunUsd: 1,
  dailyBudgetUsd: 1,
  maxProjectBudgetUsd: 5,
};

const scoringInput: ScoringInput = {
  keywordId: "018f0f00-0000-7000-8000-000000000001",
  patternType: "BEST_X_FOR_Y",
  intentType: "COMMERCIAL_INVESTIGATION",
  hasQualifier: true,
  facetCount: 2,
  clusterSize: 2,
  analysisConfidence: 0.9,
  nicheActive: true,
};

describe("opportunity-v1", () => {
  it("is deterministic and has no M1 hypothesis input", () => {
    const before = calculateOpportunityScore(scoringInput);
    const unrelatedM1Hypothesis = { score: 88 };
    unrelatedM1Hypothesis.score = 1;
    const after = calculateOpportunityScore(scoringInput);
    expect(after).toEqual(before);
    expect(after).toMatchObject({
      scoreKind: "OPPORTUNITY_SCORE",
      modelId: "opportunity-v1",
      modelVersion: "1.0.0",
      dataCompleteness: 0.4,
    });
    expect(after.missingInputs).toEqual(
      expect.arrayContaining(["search_volume", "serp_retrieved"]),
    );
  });

  it("stores ten provisional scores and remains independent of M1 mutation", async () => {
    const testDb = await createTestDb();
    try {
      await seed(testDb.db);
      const file = await readFile(
        new URL("../../../docs/M1_TOP50_keyword_shortlist.csv", import.meta.url),
      );
      await importM1Csv(testDb.db, { content: file, sourcePath: "m1.csv" });
      await analyzeNicheKeywords(
        testDb.db,
        "problem-solving-gardening",
        caps,
      );
      const result = await scoreNicheKeywords(
        testDb.db,
        "problem-solving-gardening",
        caps,
      );
      expect(result).toEqual({ scoredCount: 10, cacheHits: 0 });

      const before = await testDb.db.select().from(keywordScores);
      expect(before).toHaveLength(10);
      expect(
        before.every(
          (score) =>
            score.scoreKind === "OPPORTUNITY_SCORE" &&
            score.modelId === "opportunity-v1" &&
            score.score !== null &&
            score.band.startsWith("PROVISIONAL_") &&
            score.missingInputs.includes("search_volume") &&
            score.missingInputs.includes("serp_retrieved"),
        ),
      ).toBe(true);
      expect(
        before.filter((score) => score.scoreKind === "SERP_SCORE"),
      ).toHaveLength(0);

      await testDb.db
        .update(keywordMetrics)
        .set({ numericValue: "1.000", updatedAt: new Date() })
        .where(eq(keywordMetrics.metricName, "M1_HYPOTHESIS_SCORE"));
      const repeated = await scoreNicheKeywords(
        testDb.db,
        "problem-solving-gardening",
        caps,
      );
      expect(repeated).toEqual({ scoredCount: 10, cacheHits: 10 });
      const after = await testDb.db.select().from(keywordScores);
      expect(after.map((score) => score.score)).toEqual(
        before.map((score) => score.score),
      );
      const hypotheses = await testDb.db
        .select()
        .from(keywordMetrics)
        .where(eq(keywordMetrics.metricName, "M1_HYPOTHESIS_SCORE"));
      expect(
        hypotheses.every(
          (metric) =>
            metric.numericValue === "1.000" &&
            metric.sourceType === "HYPOTHESIS",
        ),
      ).toBe(true);
    } finally {
      await testDb.close();
    }
  });
});
