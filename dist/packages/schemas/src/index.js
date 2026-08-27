import { z } from "zod";
export const sourceTypeSchema = z.enum([
    "MEASURED",
    "HYPOTHESIS",
    "DERIVED",
    "MANUAL",
    "UNAVAILABLE",
]);
export const valueStatusSchema = z.enum([
    "PRESENT",
    "UNAVAILABLE",
    "CONTRADICTED",
    "STALE",
]);
export const provenanceSchema = z
    .object({
    sourceType: sourceTypeSchema,
    sourceName: z.string().min(1),
    sourceUrl: z.url().nullable(),
    sourceRef: z.string().min(1).nullable(),
    confidence: z.number().min(0).max(1).nullable(),
    valueStatus: valueStatusSchema,
    observedAt: z.iso.datetime().nullable(),
    agentRunId: z.uuid().nullable(),
})
    .strict();
export const metricNameSchema = z.enum([
    "M1_HYPOTHESIS_SCORE",
    "M1_HYPOTHESIS_SERP_LABEL",
    "M1_SOURCE_RANK",
    "M1_RESEARCH_PRIORITY",
    "search_volume",
]);
export const keywordMetricSchema = z
    .object({
    keywordId: z.uuid(),
    metricName: metricNameSchema,
    numericValue: z.number().nullable(),
    textValue: z.string().nullable(),
    provenance: provenanceSchema,
})
    .strict();
export const importRowSchema = z
    .object({
    rowNumber: z.number().int().positive(),
    raw: z.record(z.string(), z.string()),
    rowHash: z.string().regex(/^[a-f0-9]{64}$/),
    status: z.enum(["ACCEPTED", "REJECTED", "DUPLICATE"]),
    rejectReason: z.string().nullable(),
    keywordId: z.uuid().nullable(),
})
    .strict();
export const patternTypeSchema = z.enum([
    "BEST_X_FOR_Y",
    "BEST_ATTRIBUTE_X",
    "X_VS_Y",
    "BEST_X_UNDER_PRICE",
    "HOW_TO_CHOOSE_X",
    "BUYING_GUIDE",
    "OTHER",
]);
export const intentTypeSchema = z.enum([
    "COMMERCIAL_INVESTIGATION",
    "TRANSACTIONAL",
    "INFORMATIONAL",
    "MIXED",
    "UNKNOWN",
]);
export const facetSchema = z
    .object({
    kind: z.enum([
        "PRODUCT",
        "USER",
        "PROBLEM",
        "ENVIRONMENT",
        "USE_CASE",
        "CONSTRAINT",
        "ATTRIBUTE",
    ]),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    label: z.string().min(1),
    confidence: z.number().min(0).max(1),
})
    .strict();
export const keywordAnalysisSchema = z
    .object({
    patternType: patternTypeSchema,
    intentType: intentTypeSchema,
    productText: z.string().min(1).nullable(),
    qualifierText: z.string().min(1).nullable(),
    facets: z.array(facetSchema),
    userText: z.string().min(1).nullable(),
    problemText: z.string().min(1).nullable(),
    environmentText: z.string().min(1).nullable(),
    constraintText: z.string().min(1).nullable(),
    clusterSuggestion: z
        .object({ slug: z.string().min(1), label: z.string().min(1) })
        .strict()
        .nullable(),
    relatedCandidates: z.array(z
        .object({
        text: z.string().min(1),
        origin: z.enum(["TEMPLATE", "LEXICON", "LLM"]),
        confidence: z.number().min(0).max(0.5),
    })
        .strict()),
    confidence: z.number().min(0).max(1),
    path: z.enum(["DETERMINISTIC", "DETERMINISTIC_PLUS_LLM", "LLM"]),
    notes: z.array(z.string()),
})
    .strict();
export const opportunityScoreSchema = z
    .object({
    scoreKind: z.literal("OPPORTUNITY_SCORE"),
    modelId: z.literal("opportunity-v1"),
    modelVersion: z.string().min(1),
    score: z.number().min(0).max(100).nullable(),
    band: z.enum([
        "PROVISIONAL_HIGH",
        "PROVISIONAL_MEDIUM",
        "PROVISIONAL_LOW",
        "INSUFFICIENT_DATA",
    ]),
    dataCompleteness: z.number().min(0).max(1),
    components: z.record(z.string(), z.number()),
    missingInputs: z.array(z.string()),
})
    .strict();
export const reportSchema = z
    .object({
    generatedAt: z.iso.datetime(),
    niche: z.string().min(1),
    keywords: z.array(z
        .object({
        keyword: z.string().min(1),
        opportunityScore: opportunityScoreSchema,
        m1HypothesisScore: z.number().nullable(),
        m1SerpLabel: z.string().nullable(),
    })
        .strict()),
    totalEstimatedCostUsd: z.number().nonnegative(),
    llmCalls: z.number().int().nonnegative(),
})
    .strict();
//# sourceMappingURL=index.js.map