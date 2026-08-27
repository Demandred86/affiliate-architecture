import { z } from "zod";
export declare const sourceTypeSchema: z.ZodEnum<{
    DERIVED: "DERIVED";
    HYPOTHESIS: "HYPOTHESIS";
    MANUAL: "MANUAL";
    MEASURED: "MEASURED";
    UNAVAILABLE: "UNAVAILABLE";
}>;
export declare const valueStatusSchema: z.ZodEnum<{
    CONTRADICTED: "CONTRADICTED";
    PRESENT: "PRESENT";
    STALE: "STALE";
    UNAVAILABLE: "UNAVAILABLE";
}>;
export declare const provenanceSchema: z.ZodObject<{
    sourceType: z.ZodEnum<{
        DERIVED: "DERIVED";
        HYPOTHESIS: "HYPOTHESIS";
        MANUAL: "MANUAL";
        MEASURED: "MEASURED";
        UNAVAILABLE: "UNAVAILABLE";
    }>;
    sourceName: z.ZodString;
    sourceUrl: z.ZodNullable<z.ZodURL>;
    sourceRef: z.ZodNullable<z.ZodString>;
    confidence: z.ZodNullable<z.ZodNumber>;
    valueStatus: z.ZodEnum<{
        CONTRADICTED: "CONTRADICTED";
        PRESENT: "PRESENT";
        STALE: "STALE";
        UNAVAILABLE: "UNAVAILABLE";
    }>;
    observedAt: z.ZodNullable<z.ZodISODateTime>;
    agentRunId: z.ZodNullable<z.ZodUUID>;
}, z.core.$strict>;
export declare const metricNameSchema: z.ZodEnum<{
    M1_HYPOTHESIS_SCORE: "M1_HYPOTHESIS_SCORE";
    M1_HYPOTHESIS_SERP_LABEL: "M1_HYPOTHESIS_SERP_LABEL";
    M1_RESEARCH_PRIORITY: "M1_RESEARCH_PRIORITY";
    M1_SOURCE_RANK: "M1_SOURCE_RANK";
    search_volume: "search_volume";
}>;
export declare const keywordMetricSchema: z.ZodObject<{
    keywordId: z.ZodUUID;
    metricName: z.ZodEnum<{
        M1_HYPOTHESIS_SCORE: "M1_HYPOTHESIS_SCORE";
        M1_HYPOTHESIS_SERP_LABEL: "M1_HYPOTHESIS_SERP_LABEL";
        M1_RESEARCH_PRIORITY: "M1_RESEARCH_PRIORITY";
        M1_SOURCE_RANK: "M1_SOURCE_RANK";
        search_volume: "search_volume";
    }>;
    numericValue: z.ZodNullable<z.ZodNumber>;
    textValue: z.ZodNullable<z.ZodString>;
    provenance: z.ZodObject<{
        sourceType: z.ZodEnum<{
            DERIVED: "DERIVED";
            HYPOTHESIS: "HYPOTHESIS";
            MANUAL: "MANUAL";
            MEASURED: "MEASURED";
            UNAVAILABLE: "UNAVAILABLE";
        }>;
        sourceName: z.ZodString;
        sourceUrl: z.ZodNullable<z.ZodURL>;
        sourceRef: z.ZodNullable<z.ZodString>;
        confidence: z.ZodNullable<z.ZodNumber>;
        valueStatus: z.ZodEnum<{
            CONTRADICTED: "CONTRADICTED";
            PRESENT: "PRESENT";
            STALE: "STALE";
            UNAVAILABLE: "UNAVAILABLE";
        }>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
        agentRunId: z.ZodNullable<z.ZodUUID>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const importRowSchema: z.ZodObject<{
    rowNumber: z.ZodNumber;
    raw: z.ZodRecord<z.ZodString, z.ZodString>;
    rowHash: z.ZodString;
    status: z.ZodEnum<{
        ACCEPTED: "ACCEPTED";
        DUPLICATE: "DUPLICATE";
        REJECTED: "REJECTED";
    }>;
    rejectReason: z.ZodNullable<z.ZodString>;
    keywordId: z.ZodNullable<z.ZodUUID>;
}, z.core.$strict>;
export declare const patternTypeSchema: z.ZodEnum<{
    BEST_ATTRIBUTE_X: "BEST_ATTRIBUTE_X";
    BEST_X_FOR_Y: "BEST_X_FOR_Y";
    BEST_X_UNDER_PRICE: "BEST_X_UNDER_PRICE";
    BUYING_GUIDE: "BUYING_GUIDE";
    HOW_TO_CHOOSE_X: "HOW_TO_CHOOSE_X";
    OTHER: "OTHER";
    X_VS_Y: "X_VS_Y";
}>;
export declare const intentTypeSchema: z.ZodEnum<{
    COMMERCIAL_INVESTIGATION: "COMMERCIAL_INVESTIGATION";
    INFORMATIONAL: "INFORMATIONAL";
    MIXED: "MIXED";
    TRANSACTIONAL: "TRANSACTIONAL";
    UNKNOWN: "UNKNOWN";
}>;
export declare const facetSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        ATTRIBUTE: "ATTRIBUTE";
        CONSTRAINT: "CONSTRAINT";
        ENVIRONMENT: "ENVIRONMENT";
        PROBLEM: "PROBLEM";
        PRODUCT: "PRODUCT";
        USER: "USER";
        USE_CASE: "USE_CASE";
    }>;
    slug: z.ZodString;
    label: z.ZodString;
    confidence: z.ZodNumber;
}, z.core.$strict>;
export declare const keywordAnalysisSchema: z.ZodObject<{
    patternType: z.ZodEnum<{
        BEST_ATTRIBUTE_X: "BEST_ATTRIBUTE_X";
        BEST_X_FOR_Y: "BEST_X_FOR_Y";
        BEST_X_UNDER_PRICE: "BEST_X_UNDER_PRICE";
        BUYING_GUIDE: "BUYING_GUIDE";
        HOW_TO_CHOOSE_X: "HOW_TO_CHOOSE_X";
        OTHER: "OTHER";
        X_VS_Y: "X_VS_Y";
    }>;
    intentType: z.ZodEnum<{
        COMMERCIAL_INVESTIGATION: "COMMERCIAL_INVESTIGATION";
        INFORMATIONAL: "INFORMATIONAL";
        MIXED: "MIXED";
        TRANSACTIONAL: "TRANSACTIONAL";
        UNKNOWN: "UNKNOWN";
    }>;
    productText: z.ZodNullable<z.ZodString>;
    qualifierText: z.ZodNullable<z.ZodString>;
    facets: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            ATTRIBUTE: "ATTRIBUTE";
            CONSTRAINT: "CONSTRAINT";
            ENVIRONMENT: "ENVIRONMENT";
            PROBLEM: "PROBLEM";
            PRODUCT: "PRODUCT";
            USER: "USER";
            USE_CASE: "USE_CASE";
        }>;
        slug: z.ZodString;
        label: z.ZodString;
        confidence: z.ZodNumber;
    }, z.core.$strict>>;
    userText: z.ZodNullable<z.ZodString>;
    problemText: z.ZodNullable<z.ZodString>;
    environmentText: z.ZodNullable<z.ZodString>;
    constraintText: z.ZodNullable<z.ZodString>;
    clusterSuggestion: z.ZodNullable<z.ZodObject<{
        slug: z.ZodString;
        label: z.ZodString;
    }, z.core.$strict>>;
    relatedCandidates: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        origin: z.ZodEnum<{
            LEXICON: "LEXICON";
            LLM: "LLM";
            TEMPLATE: "TEMPLATE";
        }>;
        confidence: z.ZodNumber;
    }, z.core.$strict>>;
    confidence: z.ZodNumber;
    path: z.ZodEnum<{
        DETERMINISTIC: "DETERMINISTIC";
        DETERMINISTIC_PLUS_LLM: "DETERMINISTIC_PLUS_LLM";
        LLM: "LLM";
    }>;
    notes: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export declare const opportunityScoreSchema: z.ZodObject<{
    scoreKind: z.ZodLiteral<"OPPORTUNITY_SCORE">;
    modelId: z.ZodLiteral<"opportunity-v1">;
    modelVersion: z.ZodString;
    score: z.ZodNullable<z.ZodNumber>;
    band: z.ZodEnum<{
        INSUFFICIENT_DATA: "INSUFFICIENT_DATA";
        PROVISIONAL_HIGH: "PROVISIONAL_HIGH";
        PROVISIONAL_LOW: "PROVISIONAL_LOW";
        PROVISIONAL_MEDIUM: "PROVISIONAL_MEDIUM";
    }>;
    dataCompleteness: z.ZodNumber;
    components: z.ZodRecord<z.ZodString, z.ZodNumber>;
    missingInputs: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export declare const reportSchema: z.ZodObject<{
    generatedAt: z.ZodISODateTime;
    niche: z.ZodString;
    keywords: z.ZodArray<z.ZodObject<{
        keyword: z.ZodString;
        opportunityScore: z.ZodObject<{
            scoreKind: z.ZodLiteral<"OPPORTUNITY_SCORE">;
            modelId: z.ZodLiteral<"opportunity-v1">;
            modelVersion: z.ZodString;
            score: z.ZodNullable<z.ZodNumber>;
            band: z.ZodEnum<{
                INSUFFICIENT_DATA: "INSUFFICIENT_DATA";
                PROVISIONAL_HIGH: "PROVISIONAL_HIGH";
                PROVISIONAL_LOW: "PROVISIONAL_LOW";
                PROVISIONAL_MEDIUM: "PROVISIONAL_MEDIUM";
            }>;
            dataCompleteness: z.ZodNumber;
            components: z.ZodRecord<z.ZodString, z.ZodNumber>;
            missingInputs: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        m1HypothesisScore: z.ZodNullable<z.ZodNumber>;
        m1SerpLabel: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    totalEstimatedCostUsd: z.ZodNumber;
    llmCalls: z.ZodNumber;
}, z.core.$strict>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type KeywordAnalysis = z.infer<typeof keywordAnalysisSchema>;
export type OpportunityScore = z.infer<typeof opportunityScoreSchema>;
export type PipelineReport = z.infer<typeof reportSchema>;
//# sourceMappingURL=index.d.ts.map