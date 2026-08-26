import { createHash } from "node:crypto";
import type { AppConfig } from "@ase/config";
import {
  agentPrompts,
  agentRuns,
  costEvents,
  type Database,
} from "@ase/database";
import { and, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { ZodError, type ZodType } from "zod";

export interface BudgetCaps {
  maxCostPerRunUsd: number;
  dailyBudgetUsd: number;
  maxProjectBudgetUsd: number;
}

export function budgetCapsFromConfig(
  config: Pick<
    AppConfig,
    | "MAX_COST_PER_RUN_USD"
    | "DAILY_BUDGET_USD"
    | "MAX_PROJECT_BUDGET_USD"
  >,
): BudgetCaps {
  return {
    maxCostPerRunUsd: config.MAX_COST_PER_RUN_USD,
    dailyBudgetUsd: config.DAILY_BUDGET_USD,
    maxProjectBudgetUsd: config.MAX_PROJECT_BUDGET_USD,
  };
}

export interface BudgetUsage {
  runSpentUsd: number;
  dailySpentUsd: number;
  projectSpentUsd: number;
}

export type BudgetDecision =
  | { allowed: true }
  | {
      allowed: false;
      exceeded: "PER_RUN" | "DAILY" | "PROJECT";
    };

export class BudgetExceededError extends Error {
  public readonly code = "BUDGET_EXCEEDED";

  public constructor(
    public readonly exceeded: "PER_RUN" | "DAILY" | "PROJECT",
  ) {
    super(`BUDGET_EXCEEDED: ${exceeded}`);
    this.name = "BudgetExceededError";
  }
}

function requireNonNegativeFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number`);
  }
}

export function checkBudget(
  caps: BudgetCaps,
  usage: BudgetUsage,
  estimatedCostUsd: number,
): BudgetDecision {
  for (const [name, value] of Object.entries({
    ...caps,
    ...usage,
    estimatedCostUsd,
  })) {
    requireNonNegativeFinite(name, value);
  }

  if (usage.runSpentUsd + estimatedCostUsd > caps.maxCostPerRunUsd) {
    return { allowed: false, exceeded: "PER_RUN" };
  }
  if (usage.dailySpentUsd + estimatedCostUsd > caps.dailyBudgetUsd) {
    return { allowed: false, exceeded: "DAILY" };
  }
  if (usage.projectSpentUsd + estimatedCostUsd > caps.maxProjectBudgetUsd) {
    return { allowed: false, exceeded: "PROJECT" };
  }
  return { allowed: true };
}

export class BudgetGuard {
  public constructor(
    private readonly db: Database,
    private readonly caps: BudgetCaps,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async assertCanSpend(
    estimatedCostUsd: number,
    runSpentUsd = 0,
  ): Promise<void> {
    const events = await this.db
      .select({
        cost: costEvents.estimatedCostUsd,
        occurredAt: costEvents.occurredAt,
      })
      .from(costEvents);
    const now = this.now();
    const startOfUtcDay = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const endOfUtcDay = startOfUtcDay + 86_400_000;
    const projectSpentUsd = events.reduce(
      (sum, event) => sum + Number(event.cost),
      0,
    );
    const dailySpentUsd = events.reduce((sum, event) => {
      const occurredAt = event.occurredAt.getTime();
      return occurredAt >= startOfUtcDay && occurredAt < endOfUtcDay
        ? sum + Number(event.cost)
        : sum;
    }, 0);
    const decision = checkBudget(
      this.caps,
      { runSpentUsd, dailySpentUsd, projectSpentUsd },
      estimatedCostUsd,
    );
    if (!decision.allowed) {
      throw new BudgetExceededError(decision.exceeded);
    }
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new TypeError("Value is not JSON serializable");
    return encoded;
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `{${entries
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(",")}}`;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

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

function failureCode(error: unknown) {
  if (error instanceof ZodError) return "INVALID_OUTPUT" as const;
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "FABRICATED_NUMERIC" ||
      error.code === "FABRICATED_EXPERIENCE")
  ) {
    return error.code;
  }
  return "FAILED" as const;
}

export class AgentRunner {
  private readonly now: () => Date;
  private readonly budget: BudgetGuard;

  public constructor(
    private readonly db: Database,
    options: AgentRunnerOptions,
  ) {
    this.now = options.now ?? (() => new Date());
    this.budget = new BudgetGuard(db, options.budgetCaps, this.now);
  }

  async run<I, O>(
    job: DeterministicJob<I, O>,
    rawInput: unknown,
  ): Promise<AgentRunResult<O>> {
    const input = job.inputSchema.parse(rawInput);
    const inputJson = canonicalJson(input);
    const inputHash = sha256(inputJson);
    const promptHash = sha256(job.prompt.content);
    await this.persistPrompt(job, promptHash);

    const idempotencyKey = sha256(
      canonicalJson({
        agentId: job.agentId,
        agentVersion: job.agentVersion,
        input: JSON.parse(inputJson) as unknown,
        model: "deterministic",
        promptHashes: [promptHash],
      }),
    );
    const [cached] = await this.db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.idempotencyKey, idempotencyKey))
      .limit(1);
    if (cached?.outputJson !== null && cached?.status === "SUCCEEDED") {
      return {
        runId: cached.id,
        status: "CACHED",
        cacheHit: true,
        output: job.outputSchema.parse(cached.outputJson),
        idempotencyKey,
        promptHash,
      };
    }
    if (cached) {
      throw new Error(`Existing non-reusable agent run: ${cached.status}`);
    }

    await this.budget.assertCanSpend(0);
    const runId = uuidv7();
    const startedAt = this.now();
    await this.db.insert(agentRuns).values({
      id: runId,
      agentId: job.agentId,
      agentVersion: job.agentVersion,
      idempotencyKey,
      status: "RUNNING",
      inputHash,
      inputJson: input,
      outputJson: null,
      model: "deterministic",
      provider: "none",
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: "0",
      durationMs: 0,
      startedAt,
      traceId: uuidv7(),
    });

    try {
      const output = job.outputSchema.parse(await job.execute(input));
      job.guard?.(input, output);
      const finishedAt = this.now();
      await this.db
        .update(agentRuns)
        .set({
          status: "SUCCEEDED",
          outputJson: output,
          durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
          finishedAt,
          updatedAt: finishedAt,
        })
        .where(eq(agentRuns.id, runId));
      await this.recordZeroCost(runId, finishedAt);
      return {
        runId,
        status: "SUCCEEDED",
        cacheHit: false,
        output,
        idempotencyKey,
        promptHash,
      };
    } catch (error) {
      const finishedAt = this.now();
      const code = failureCode(error);
      await this.db
        .update(agentRuns)
        .set({
          status: code,
          errorCode: code,
          errorMessage: error instanceof Error ? error.message : "Unknown failure",
          durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
          finishedAt,
          updatedAt: finishedAt,
        })
        .where(eq(agentRuns.id, runId));
      await this.recordZeroCost(runId, finishedAt);
      throw error;
    }
  }

  private async persistPrompt<I, O>(
    job: DeterministicJob<I, O>,
    contentHash: string,
  ): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(agentPrompts)
      .where(
        and(
          eq(agentPrompts.agentId, job.agentId),
          eq(agentPrompts.name, job.prompt.name),
          eq(agentPrompts.version, job.prompt.version),
        ),
      )
      .limit(1);
    if (existing && existing.contentHash !== contentHash) {
      throw new Error(
        `Prompt ${job.agentId}/${job.prompt.name}@${job.prompt.version} is immutable`,
      );
    }
    if (!existing) {
      await this.db.insert(agentPrompts).values({
        id: uuidv7(),
        agentId: job.agentId,
        name: job.prompt.name,
        version: job.prompt.version,
        contentHash,
        content: job.prompt.content,
        status: "ACTIVE",
      });
    }
  }

  private async recordZeroCost(runId: string, occurredAt: Date): Promise<void> {
    await this.db.insert(costEvents).values({
      id: uuidv7(),
      agentRunId: runId,
      provider: "none",
      model: "deterministic",
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: "0",
      occurredAt,
    });
  }
}
