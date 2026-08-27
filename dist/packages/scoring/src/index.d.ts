import { type BudgetCaps } from "@ase/agent-core";
import { type Database } from "@ase/database";
import { type OpportunityScore } from "@ase/schemas";
import { z } from "zod";
export declare const OPPORTUNITY_MODEL_VERSION = "1.0.0";
export declare const MISSING_COMMERCIAL_INPUTS: readonly ["search_volume", "keyword_difficulty", "cpc", "serp_retrieved", "aov_or_commission"];
declare const scoringInputSchema: z.ZodObject<{
    keywordId: z.ZodUUID;
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
    hasQualifier: z.ZodBoolean;
    facetCount: z.ZodNumber;
    clusterSize: z.ZodNumber;
    analysisConfidence: z.ZodNumber;
    nicheActive: z.ZodBoolean;
}, z.core.$strict>;
export type ScoringInput = z.infer<typeof scoringInputSchema>;
export declare function calculateOpportunityScore(input: ScoringInput): OpportunityScore;
export interface ScoreNicheResult {
    scoredCount: number;
    cacheHits: number;
}
export declare function scoreNicheKeywords(db: Database, nicheSlug: string, budgetCaps: BudgetCaps): Promise<ScoreNicheResult>;
export {};
//# sourceMappingURL=index.d.ts.map