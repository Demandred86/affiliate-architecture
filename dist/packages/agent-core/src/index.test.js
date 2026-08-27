import { agentPrompts, agentRuns, costEvents, createTestDb } from "@ase/database";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AgentRunner, BudgetExceededError, budgetCapsFromConfig, checkBudget, } from "./index.js";
const caps = budgetCapsFromConfig({
    MAX_COST_PER_RUN_USD: 0.05,
    DAILY_BUDGET_USD: 1,
    MAX_PROJECT_BUDGET_USD: 5,
});
const job = {
    agentId: "keyword",
    agentVersion: "1.0.0",
    prompt: {
        name: "analyze",
        version: "1",
        content: "Normalize the supplied keyword deterministically.",
    },
    inputSchema: z.object({ keyword: z.string() }).strict(),
    outputSchema: z.object({ normalized: z.string() }).strict(),
    execute: ({ keyword }) => ({ normalized: keyword.toLowerCase() }),
};
describe("AgentRunner", () => {
    it("persists deterministic provenance and reuses an identical run", async () => {
        const testDb = await createTestDb();
        try {
            let executions = 0;
            const runner = new AgentRunner(testDb.db, { budgetCaps: caps });
            const countedJob = {
                ...job,
                execute: (input) => {
                    executions += 1;
                    return job.execute(input);
                },
            };
            const first = await runner.run(countedJob, { keyword: "Garden Kneeler" });
            const second = await runner.run(countedJob, { keyword: "Garden Kneeler" });
            expect(first.status).toBe("SUCCEEDED");
            expect(second).toMatchObject({
                runId: first.runId,
                status: "CACHED",
                cacheHit: true,
                output: { normalized: "garden kneeler" },
                idempotencyKey: first.idempotencyKey,
                promptHash: first.promptHash,
            });
            expect(executions).toBe(1);
            const prompts = await testDb.db.select().from(agentPrompts);
            expect(prompts).toHaveLength(1);
            expect(prompts[0]).toMatchObject({
                agentId: "keyword",
                version: "1",
                contentHash: first.promptHash,
            });
            const runs = await testDb.db.select().from(agentRuns);
            expect(runs).toHaveLength(1);
            expect(runs[0]).toMatchObject({
                status: "SUCCEEDED",
                model: "deterministic",
                provider: "none",
                inputTokens: 0,
                outputTokens: 0,
                estimatedCostUsd: "0.000000",
            });
            const costs = await testDb.db.select().from(costEvents);
            expect(costs).toHaveLength(1);
            expect(costs[0]).toMatchObject({
                agentRunId: first.runId,
                model: "deterministic",
                provider: "none",
                inputTokens: 0,
                outputTokens: 0,
                estimatedCostUsd: "0.000000",
            });
            expect(costs.reduce((sum, event) => sum + Number(event.estimatedCostUsd), 0)).toBe(0);
        }
        finally {
            await testDb.close();
        }
    });
    it("invalidates the cache when prompt content or agent version changes", async () => {
        const testDb = await createTestDb();
        try {
            const runner = new AgentRunner(testDb.db, { budgetCaps: caps });
            const first = await runner.run(job, { keyword: "kneeler" });
            const nextVersion = await runner.run({
                ...job,
                agentVersion: "1.0.1",
                prompt: { ...job.prompt, version: "2", content: "Normalize keyword." },
            }, { keyword: "kneeler" });
            expect(nextVersion.runId).not.toBe(first.runId);
            expect(nextVersion.idempotencyKey).not.toBe(first.idempotencyKey);
            await expect(runner.run({
                ...job,
                prompt: { ...job.prompt, content: "Mutated content." },
            }, { keyword: "other" })).rejects.toThrow("is immutable");
        }
        finally {
            await testDb.close();
        }
    });
});
describe("three-level budget guard", () => {
    it.each([
        [
            "PER_RUN",
            { runSpentUsd: 0.05, dailySpentUsd: 0, projectSpentUsd: 0 },
        ],
        [
            "DAILY",
            { runSpentUsd: 0, dailySpentUsd: 1, projectSpentUsd: 1 },
        ],
        [
            "PROJECT",
            { runSpentUsd: 0, dailySpentUsd: 0, projectSpentUsd: 5 },
        ],
    ])("refuses positive spend when %s remaining is zero", (level, usage) => {
        expect(checkBudget(caps, usage, 0.01)).toEqual({
            allowed: false,
            exceeded: level,
        });
    });
    it("allows a zero-dollar deterministic operation at the caps", () => {
        expect(checkBudget(caps, { runSpentUsd: 0.05, dailySpentUsd: 1, projectSpentUsd: 5 }, 0)).toEqual({ allowed: true });
    });
    it("uses the required BUDGET_EXCEEDED error code", () => {
        expect(new BudgetExceededError("PROJECT")).toMatchObject({
            code: "BUDGET_EXCEEDED",
            exceeded: "PROJECT",
        });
    });
});
//# sourceMappingURL=index.test.js.map