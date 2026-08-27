import { type Database } from "@ase/database";
import { type BudgetCaps } from "@ase/agent-core";
import { type KeywordAnalysis } from "@ase/schemas";
export declare function analyzeKeyword(keyword: string): KeywordAnalysis;
export interface AnalyzeNicheResult {
    analyzedCount: number;
    cacheHits: number;
}
export declare function analyzeNicheKeywords(db: Database, nicheSlug: string, budgetCaps: BudgetCaps): Promise<AnalyzeNicheResult>;
//# sourceMappingURL=index.d.ts.map