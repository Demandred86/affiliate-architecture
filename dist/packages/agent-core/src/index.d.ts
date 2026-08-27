import type { AppConfig } from "@ase/config";
import { type Database } from "@ase/database";
import { type ZodType } from "zod";
export interface BudgetCaps {
    maxCostPerRunUsd: number;
    dailyBudgetUsd: number;
    maxProjectBudgetUsd: number;
}
export declare function budgetCapsFromConfig(config: Pick<AppConfig, "MAX_COST_PER_RUN_USD" | "DAILY_BUDGET_USD" | "MAX_PROJECT_BUDGET_USD">): BudgetCaps;
export interface BudgetUsage {
    runSpentUsd: number;
    dailySpentUsd: number;
    projectSpentUsd: number;
}
export type BudgetDecision = {
    allowed: true;
} | {
    allowed: false;
    exceeded: "PER_RUN" | "DAILY" | "PROJECT";
};
export declare class BudgetExceededError extends Error {
    readonly exceeded: "PER_RUN" | "DAILY" | "PROJECT";
    readonly code = "BUDGET_EXCEEDED";
    constructor(exceeded: "PER_RUN" | "DAILY" | "PROJECT");
}
export declare function checkBudget(caps: BudgetCaps, usage: BudgetUsage, estimatedCostUsd: number): BudgetDecision;
export declare class BudgetGuard {
    private readonly db;
    private readonly caps;
    private readonly now;
    constructor(db: Database, caps: BudgetCaps, now?: () => Date);
    assertCanSpend(estimatedCostUsd: number, runSpentUsd?: number): Promise<void>;
}
export declare function sha256(value: string): string;
export interface DeterministicJob<I, O> {
    agentId: "keyword" | "scoring";
    agentVersion: string;
    prompt: {
        name: string;
        version: string;
        content: string;
    };
    inputSchema: ZodType<I>;
    outputSchema: ZodType<O>;
    execute(input: I): O | Promise<O>;
    guard?(input: I, output: O): void;
}
export interface AgentRunResult<O> {
    runId: string;
    status: "SUCCEEDED" | "CACHED";
    cacheHit: boolean;
    output: O;
    idempotencyKey: string;
    promptHash: string;
}
export interface AgentRunnerOptions {
    budgetCaps: BudgetCaps;
    now?: () => Date;
}
export declare class AgentRunner {
    private readonly db;
    private readonly now;
    private readonly budget;
    constructor(db: Database, options: AgentRunnerOptions);
    run<I, O>(job: DeterministicJob<I, O>, rawInput: unknown): Promise<AgentRunResult<O>>;
    private persistPrompt;
    private recordZeroCost;
}
//# sourceMappingURL=index.d.ts.map