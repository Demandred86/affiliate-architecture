import { describe, expect, it } from "vitest";
import {
  keywordAnalysisSchema,
  keywordMetricSchema,
  sourceTypeSchema,
} from "./index.js";

const validAnalysis = {
  patternType: "BEST_X_FOR_Y",
  intentType: "COMMERCIAL_INVESTIGATION",
  productText: "pruning shears",
  qualifierText: "small hands",
  facets: [],
  userText: null,
  problemText: null,
  environmentText: null,
  constraintText: "small hands",
  clusterSuggestion: null,
  relatedCandidates: [],
  confidence: 0.95,
  path: "DETERMINISTIC",
  notes: [],
};

describe("schema contracts", () => {
  it("accepts explicit HYPOTHESIS provenance", () => {
    expect(sourceTypeSchema.parse("HYPOTHESIS")).toBe("HYPOTHESIS");
  });

  it("rejects invented search volume in analysis output", () => {
    expect(() =>
      keywordAnalysisSchema.parse({
        ...validAnalysis,
        search_volume: 1000,
      }),
    ).toThrow();
  });

  it("uses the canonical M1 hypothesis metric name", () => {
    const result = keywordMetricSchema.safeParse({
      keywordId: "018f22b2-7ea4-7cc0-98c1-2c7e69cdeaf1",
      metricName: "M1_HYPOTHESIS_SCORE",
      numericValue: 88,
      textValue: null,
      provenance: {
        sourceType: "HYPOTHESIS",
        sourceName: "m1-csv",
        sourceUrl: null,
        sourceRef: "row-1",
        confidence: null,
        valueStatus: "PRESENT",
        observedAt: null,
        agentRunId: null,
      },
    });
    expect(result.success).toBe(true);
  });
});
