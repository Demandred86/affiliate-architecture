#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// apps/cli/src/index.ts
import { mkdir as mkdir2, readFile as readFile2 } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// packages/agent-core/src/index.ts
import { createHash as createHash2 } from "node:crypto";

// packages/database/src/index.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

// packages/database/src/schema.ts
var schema_exports = {};
__export(schema_exports, {
  agentPrompts: () => agentPrompts,
  agentRunStatus: () => agentRunStatus,
  agentRuns: () => agentRuns,
  costEvents: () => costEvents,
  facetKind: () => facetKind,
  facets: () => facets,
  importBatchStatus: () => importBatchStatus,
  importBatches: () => importBatches,
  importRowStatus: () => importRowStatus,
  importRows: () => importRows,
  intentType: () => intentType,
  keywordAliases: () => keywordAliases,
  keywordAnalyses: () => keywordAnalyses,
  keywordClusterMembers: () => keywordClusterMembers,
  keywordClusters: () => keywordClusters,
  keywordFacets: () => keywordFacets,
  keywordMetrics: () => keywordMetrics,
  keywordScores: () => keywordScores,
  keywordStatus: () => keywordStatus,
  keywords: () => keywords,
  nicheAliases: () => nicheAliases,
  nicheStatus: () => nicheStatus,
  niches: () => niches,
  patternType: () => patternType,
  scoreBand: () => scoreBand,
  sourceType: () => sourceType,
  valueStatus: () => valueStatus
});
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
var nicheStatus = pgEnum("niche_status", ["ACTIVE", "PARKED"]);
var keywordStatus = pgEnum("keyword_status", [
  "IMPORTED",
  "ANALYZED",
  "SCORED",
  "PARKED",
  "REJECTED"
]);
var importBatchStatus = pgEnum("import_batch_status", [
  "PENDING",
  "COMPLETE",
  "PARTIAL",
  "FAILED"
]);
var importRowStatus = pgEnum("import_row_status", [
  "ACCEPTED",
  "REJECTED",
  "DUPLICATE"
]);
var sourceType = pgEnum("source_type", [
  "MEASURED",
  "HYPOTHESIS",
  "DERIVED",
  "MANUAL",
  "UNAVAILABLE"
]);
var valueStatus = pgEnum("value_status", [
  "PRESENT",
  "UNAVAILABLE",
  "CONTRADICTED",
  "STALE"
]);
var facetKind = pgEnum("facet_kind", [
  "PRODUCT",
  "USER",
  "PROBLEM",
  "ENVIRONMENT",
  "USE_CASE",
  "CONSTRAINT",
  "ATTRIBUTE"
]);
var intentType = pgEnum("intent_type", [
  "COMMERCIAL_INVESTIGATION",
  "TRANSACTIONAL",
  "INFORMATIONAL",
  "MIXED",
  "UNKNOWN"
]);
var patternType = pgEnum("pattern_type", [
  "BEST_X_FOR_Y",
  "BEST_ATTRIBUTE_X",
  "X_VS_Y",
  "BEST_X_UNDER_PRICE",
  "HOW_TO_CHOOSE_X",
  "BUYING_GUIDE",
  "OTHER"
]);
var scoreBand = pgEnum("score_band", [
  "PROVISIONAL_HIGH",
  "PROVISIONAL_MEDIUM",
  "PROVISIONAL_LOW",
  "INSUFFICIENT_DATA"
]);
var agentRunStatus = pgEnum("agent_run_status", [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "INVALID_OUTPUT",
  "FABRICATED_NUMERIC",
  "FABRICATED_EXPERIENCE",
  "BUDGET_EXCEEDED",
  "FAILED",
  "CACHED"
]);
var timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
};
var niches = pgTable(
  "niche",
  {
    id: uuid("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    status: nicheStatus("status").notNull(),
    market: text("market").notNull(),
    language: text("language").notNull(),
    ...timestamps
  },
  (table) => [
    index("niche_market_language_idx").on(table.market, table.language)
  ]
);
var nicheAliases = pgTable("niche_alias", {
  id: uuid("id").primaryKey(),
  nicheId: uuid("niche_id").notNull().references(() => niches.id),
  alias: text("alias").notNull().unique(),
  ...timestamps
});
var importBatches = pgTable(
  "import_batch",
  {
    id: uuid("id").primaryKey(),
    sourcePath: text("source_path").notNull(),
    fileSha256: text("file_sha256").notNull(),
    importerVersion: text("importer_version").notNull(),
    rowCount: integer("row_count").notNull(),
    acceptedCount: integer("accepted_count").notNull().default(0),
    rejectedCount: integer("rejected_count").notNull().default(0),
    status: importBatchStatus("status").notNull(),
    actor: text("actor").notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("import_batch_file_version_uq").on(
      table.fileSha256,
      table.importerVersion
    )
  ]
);
var agentPrompts = pgTable(
  "agent_prompt",
  {
    id: uuid("id").primaryKey(),
    agentId: text("agent_id").notNull(),
    name: text("name").notNull(),
    version: text("version").notNull(),
    contentHash: text("content_hash").notNull(),
    content: text("content").notNull(),
    status: text("status").notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("agent_prompt_identity_uq").on(
      table.agentId,
      table.name,
      table.version
    )
  ]
);
var agentRuns = pgTable(
  "agent_run",
  {
    id: uuid("id").primaryKey(),
    agentId: text("agent_id").notNull(),
    agentVersion: text("agent_version").notNull(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    status: agentRunStatus("status").notNull(),
    inputHash: text("input_hash").notNull(),
    inputJson: jsonb("input_json").notNull(),
    outputJson: jsonb("output_json"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    model: text("model").notNull(),
    provider: text("provider").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    estimatedCostUsd: numeric("estimated_cost_usd", {
      precision: 12,
      scale: 6
    }).notNull(),
    durationMs: integer("duration_ms").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    parentRunId: uuid("parent_run_id"),
    traceId: text("trace_id").notNull(),
    ...timestamps
  },
  (table) => [
    check(
      "agent_run_cost_nonnegative",
      sql`${table.estimatedCostUsd} >= 0`
    )
  ]
);
var keywords = pgTable(
  "keyword",
  {
    id: uuid("id").primaryKey(),
    nicheId: uuid("niche_id").notNull().references(() => niches.id),
    rawText: text("raw_text").notNull(),
    canonicalText: text("canonical_text").notNull(),
    canonicalHash: text("canonical_hash").notNull().unique(),
    locale: text("locale").notNull(),
    market: text("market").notNull(),
    status: keywordStatus("status").notNull(),
    firstSeenImportBatchId: uuid("first_seen_import_batch_id").notNull().references(() => importBatches.id),
    ...timestamps
  },
  (table) => [
    index("keyword_niche_status_idx").on(table.nicheId, table.status)
  ]
);
var keywordAliases = pgTable(
  "keyword_alias",
  {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id").notNull().references(() => keywords.id),
    alias: text("alias").notNull(),
    canonicalHash: text("canonical_hash").notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("keyword_alias_keyword_hash_uq").on(
      table.keywordId,
      table.canonicalHash
    )
  ]
);
var importRows = pgTable(
  "import_row",
  {
    id: uuid("id").primaryKey(),
    batchId: uuid("batch_id").notNull().references(() => importBatches.id),
    rowNumber: integer("row_number").notNull(),
    rawJson: jsonb("raw_json").notNull(),
    rowHash: text("row_hash").notNull(),
    status: importRowStatus("status").notNull(),
    rejectReason: text("reject_reason"),
    keywordId: uuid("keyword_id").references(() => keywords.id),
    ...timestamps
  },
  (table) => [
    uniqueIndex("import_row_batch_number_uq").on(
      table.batchId,
      table.rowNumber
    )
  ]
);
var keywordMetrics = pgTable(
  "keyword_metric",
  {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id").notNull().references(() => keywords.id),
    metricName: text("metric_name").notNull(),
    numericValue: numeric("numeric_value", { precision: 12, scale: 3 }),
    textValue: text("text_value"),
    sourceType: sourceType("source_type").notNull(),
    sourceName: text("source_name").notNull(),
    sourceUrl: text("source_url"),
    sourceRef: text("source_ref"),
    confidence: numeric("confidence", { precision: 4, scale: 3 }),
    valueStatus: valueStatus("value_status").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }),
    agentRunId: uuid("agent_run_id").references(() => agentRuns.id),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [
    uniqueIndex("keyword_metric_current_uq").on(table.keywordId, table.metricName, table.sourceName).where(sql`${table.supersededAt} is null`),
    check(
      "keyword_metric_numeric_present",
      sql`${table.numericValue} is null or ${table.valueStatus} = 'PRESENT'`
    )
  ]
);
var facets = pgTable("facet", {
  id: uuid("id").primaryKey(),
  kind: facetKind("kind").notNull(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  synonyms: text("synonyms").array().notNull().default(sql`'{}'::text[]`),
  ...timestamps
});
var keywordFacets = pgTable(
  "keyword_facet",
  {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id").notNull().references(() => keywords.id),
    facetId: uuid("facet_id").notNull().references(() => facets.id),
    role: text("role").notNull(),
    agentRunId: uuid("agent_run_id").references(() => agentRuns.id),
    ...timestamps
  },
  (table) => [
    uniqueIndex("keyword_facet_pair_uq").on(table.keywordId, table.facetId)
  ]
);
var keywordClusters = pgTable(
  "keyword_cluster",
  {
    id: uuid("id").primaryKey(),
    nicheId: uuid("niche_id").notNull().references(() => niches.id),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    method: text("method").notNull(),
    methodVersion: text("method_version").notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("keyword_cluster_niche_slug_uq").on(
      table.nicheId,
      table.slug
    )
  ]
);
var keywordClusterMembers = pgTable(
  "keyword_cluster_member",
  {
    id: uuid("id").primaryKey(),
    clusterId: uuid("cluster_id").notNull().references(() => keywordClusters.id),
    keywordId: uuid("keyword_id").notNull().references(() => keywords.id),
    isPrimary: boolean("is_primary").notNull().default(false),
    ...timestamps
  },
  (table) => [
    uniqueIndex("keyword_cluster_member_pair_uq").on(
      table.clusterId,
      table.keywordId
    )
  ]
);
var keywordAnalyses = pgTable(
  "keyword_analysis",
  {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id").notNull().references(() => keywords.id),
    patternType: patternType("pattern_type").notNull(),
    intentType: intentType("intent_type").notNull(),
    productText: text("product_text"),
    qualifierText: text("qualifier_text"),
    userText: text("user_text"),
    problemText: text("problem_text"),
    environmentText: text("environment_text"),
    constraintText: text("constraint_text"),
    confidence: numeric("confidence", { precision: 4, scale: 3 }).notNull(),
    path: text("path").notNull(),
    relatedCandidates: jsonb("related_candidates").notNull(),
    rawOutput: jsonb("raw_output").notNull(),
    agentRunId: uuid("agent_run_id").notNull().references(() => agentRuns.id),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [
    uniqueIndex("keyword_analysis_current_uq").on(table.keywordId).where(sql`${table.supersededAt} is null`)
  ]
);
var keywordScores = pgTable(
  "keyword_score",
  {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id").notNull().references(() => keywords.id),
    scoreKind: text("score_kind").notNull(),
    modelId: text("model_id").notNull(),
    modelVersion: text("model_version").notNull(),
    score: numeric("score", { precision: 6, scale: 3 }),
    band: scoreBand("band").notNull(),
    dataCompleteness: numeric("data_completeness", {
      precision: 4,
      scale: 3
    }).notNull(),
    components: jsonb("components").notNull(),
    missingInputs: text("missing_inputs").array().notNull(),
    agentRunId: uuid("agent_run_id").references(() => agentRuns.id),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [
    uniqueIndex("keyword_score_current_uq").on(table.keywordId, table.scoreKind, table.modelId).where(sql`${table.supersededAt} is null`),
    check(
      "keyword_score_null_iff_insufficient",
      sql`(${table.score} is null) = (${table.band} = 'INSUFFICIENT_DATA')`
    ),
    check(
      "keyword_score_missing_iff_complete",
      sql`(cardinality(${table.missingInputs}) = 0) = (${table.dataCompleteness} = 1)`
    )
  ]
);
var costEvents = pgTable(
  "cost_event",
  {
    id: uuid("id").primaryKey(),
    agentRunId: uuid("agent_run_id").notNull().references(() => agentRuns.id),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    estimatedCostUsd: numeric("estimated_cost_usd", {
      precision: 12,
      scale: 6
    }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestamps
  },
  (table) => [
    check(
      "cost_event_cost_nonnegative",
      sql`${table.estimatedCostUsd} >= 0`
    )
  ]
);

// packages/database/src/repositories.ts
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
function canonicalizeKeyword(value) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}
function keywordCanonicalHash(canonicalText, market, locale) {
  return createHash("sha256").update(`${canonicalText}\0${market}\0${locale}`).digest("hex");
}
var KeywordRepository = class {
  constructor(db) {
    this.db = db;
  }
  db;
  async insertCanonical(input) {
    const market = input.market ?? "US";
    const locale = input.locale ?? "en-US";
    const canonicalText = canonicalizeKeyword(input.rawText);
    const canonicalHash = keywordCanonicalHash(canonicalText, market, locale);
    const [inserted] = await this.db.insert(keywords).values({
      id: uuidv7(),
      nicheId: input.nicheId,
      rawText: input.rawText,
      canonicalText,
      canonicalHash,
      locale,
      market,
      status: input.status ?? "IMPORTED",
      firstSeenImportBatchId: input.firstSeenImportBatchId
    }).onConflictDoNothing({ target: keywords.canonicalHash }).returning();
    if (inserted) return inserted;
    const [existing] = await this.db.select().from(keywords).where(eq(keywords.canonicalHash, canonicalHash)).limit(1);
    if (!existing) throw new Error("Keyword conflict did not return a row");
    return existing;
  }
  async count() {
    const rows = await this.db.select({ id: keywords.id }).from(keywords);
    return rows.length;
  }
};

// packages/database/src/seed.ts
import { v7 as uuidv72 } from "uuid";
var nicheSeeds = [
  {
    slug: "problem-solving-gardening",
    name: "Problem-Solving Gardening",
    status: "ACTIVE"
  },
  {
    slug: "tools-home-improvement",
    name: "Tools / Home Improvement",
    status: "PARKED"
  },
  {
    slug: "automotive-accessories",
    name: "Automotive Accessories",
    status: "PARKED"
  },
  {
    slug: "outdoor-camping",
    name: "Outdoor / Camping",
    status: "PARKED"
  },
  {
    slug: "kitchen-micro-niche",
    name: "Kitchen Micro-Niche",
    status: "PARKED"
  }
];
var facetSeeds = [
  ["CONSTRAINT", "small-hands", "small hands"],
  ["ENVIRONMENT", "vegetable-garden", "vegetable garden"],
  ["ENVIRONMENT", "raised-beds", "raised beds"],
  ["USE_CASE", "tomatoes", "tomatoes"],
  ["ENVIRONMENT", "small-garden", "small garden"],
  ["USER", "beginners", "beginners"],
  ["USER", "elderly", "elderly"],
  ["ATTRIBUTE", "lightweight", "lightweight"]
];
async function seed(db) {
  const inserted = await db.insert(niches).values(
    nicheSeeds.map((niche) => ({
      id: uuidv72(),
      ...niche,
      market: "US",
      language: "en-US"
    }))
  ).onConflictDoNothing({ target: niches.slug }).returning();
  const gardening = inserted.find((niche) => niche.slug === "problem-solving-gardening") ?? await db.query.niches.findFirst({
    where: (table, { eq: eq7 }) => eq7(table.slug, "problem-solving-gardening")
  });
  if (!gardening) throw new Error("Gardening niche seed failed");
  await db.insert(nicheAliases).values({
    id: uuidv72(),
    nicheId: gardening.id,
    alias: "Lawn & Garden"
  }).onConflictDoNothing({ target: nicheAliases.alias });
  await db.insert(facets).values(
    facetSeeds.map(([kind, slug, label]) => ({
      id: uuidv72(),
      kind,
      slug,
      label,
      synonyms: [label]
    }))
  ).onConflictDoNothing({ target: facets.slug });
}

// packages/database/src/index.ts
function createDatabase(client) {
  return drizzle(client, { schema: schema_exports });
}
async function migrate(client) {
  const migrationUrl = new URL("../drizzle/0000_lean_m2.sql", import.meta.url);
  const migration = await readFile(migrationUrl, "utf8").catch((error) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return readFile(
        join(process.cwd(), "packages", "database", "drizzle", "0000_lean_m2.sql"),
        "utf8"
      );
    }
    throw error;
  });
  await client.exec(migration);
}

// packages/agent-core/src/index.ts
import { and, eq as eq2 } from "drizzle-orm";
import { v7 as uuidv73 } from "uuid";
import { ZodError } from "zod";
function budgetCapsFromConfig(config) {
  return {
    maxCostPerRunUsd: config.MAX_COST_PER_RUN_USD,
    dailyBudgetUsd: config.DAILY_BUDGET_USD,
    maxProjectBudgetUsd: config.MAX_PROJECT_BUDGET_USD
  };
}
var BudgetExceededError = class extends Error {
  constructor(exceeded) {
    super(`BUDGET_EXCEEDED: ${exceeded}`);
    this.exceeded = exceeded;
    this.name = "BudgetExceededError";
  }
  exceeded;
  code = "BUDGET_EXCEEDED";
};
function requireNonNegativeFinite(name, value) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number`);
  }
}
function checkBudget(caps, usage2, estimatedCostUsd) {
  for (const [name, value] of Object.entries({
    ...caps,
    ...usage2,
    estimatedCostUsd
  })) {
    requireNonNegativeFinite(name, value);
  }
  if (usage2.runSpentUsd + estimatedCostUsd > caps.maxCostPerRunUsd) {
    return { allowed: false, exceeded: "PER_RUN" };
  }
  if (usage2.dailySpentUsd + estimatedCostUsd > caps.dailyBudgetUsd) {
    return { allowed: false, exceeded: "DAILY" };
  }
  if (usage2.projectSpentUsd + estimatedCostUsd > caps.maxProjectBudgetUsd) {
    return { allowed: false, exceeded: "PROJECT" };
  }
  return { allowed: true };
}
var BudgetGuard = class {
  constructor(db, caps, now = () => /* @__PURE__ */ new Date()) {
    this.db = db;
    this.caps = caps;
    this.now = now;
  }
  db;
  caps;
  now;
  async assertCanSpend(estimatedCostUsd, runSpentUsd = 0) {
    const events = await this.db.select({
      cost: costEvents.estimatedCostUsd,
      occurredAt: costEvents.occurredAt
    }).from(costEvents);
    const now = this.now();
    const startOfUtcDay = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );
    const endOfUtcDay = startOfUtcDay + 864e5;
    const projectSpentUsd = events.reduce(
      (sum, event) => sum + Number(event.cost),
      0
    );
    const dailySpentUsd = events.reduce((sum, event) => {
      const occurredAt = event.occurredAt.getTime();
      return occurredAt >= startOfUtcDay && occurredAt < endOfUtcDay ? sum + Number(event.cost) : sum;
    }, 0);
    const decision = checkBudget(
      this.caps,
      { runSpentUsd, dailySpentUsd, projectSpentUsd },
      estimatedCostUsd
    );
    if (!decision.allowed) {
      throw new BudgetExceededError(decision.exceeded);
    }
  }
};
function canonicalJson(value) {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === void 0) throw new TypeError("Value is not JSON serializable");
    return encoded;
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  const entries = Object.entries(value).sort(
    ([a], [b]) => a.localeCompare(b)
  );
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`).join(",")}}`;
}
function sha256(value) {
  return createHash2("sha256").update(value).digest("hex");
}
function failureCode(error) {
  if (error instanceof ZodError) return "INVALID_OUTPUT";
  if (typeof error === "object" && error !== null && "code" in error && (error.code === "FABRICATED_NUMERIC" || error.code === "FABRICATED_EXPERIENCE")) {
    return error.code;
  }
  return "FAILED";
}
var AgentRunner = class {
  constructor(db, options) {
    this.db = db;
    this.now = options.now ?? (() => /* @__PURE__ */ new Date());
    this.budget = new BudgetGuard(db, options.budgetCaps, this.now);
  }
  db;
  now;
  budget;
  async run(job, rawInput) {
    const input = job.inputSchema.parse(rawInput);
    const inputJson = canonicalJson(input);
    const inputHash = sha256(inputJson);
    const promptHash = sha256(job.prompt.content);
    await this.persistPrompt(job, promptHash);
    const idempotencyKey = sha256(
      canonicalJson({
        agentId: job.agentId,
        agentVersion: job.agentVersion,
        input: JSON.parse(inputJson),
        model: "deterministic",
        promptHashes: [promptHash]
      })
    );
    const [cached] = await this.db.select().from(agentRuns).where(eq2(agentRuns.idempotencyKey, idempotencyKey)).limit(1);
    if (cached?.outputJson !== null && cached?.status === "SUCCEEDED") {
      return {
        runId: cached.id,
        status: "CACHED",
        cacheHit: true,
        output: job.outputSchema.parse(cached.outputJson),
        idempotencyKey,
        promptHash
      };
    }
    if (cached) {
      throw new Error(`Existing non-reusable agent run: ${cached.status}`);
    }
    await this.budget.assertCanSpend(0);
    const runId = uuidv73();
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
      traceId: uuidv73()
    });
    try {
      const output = job.outputSchema.parse(await job.execute(input));
      job.guard?.(input, output);
      const finishedAt = this.now();
      await this.db.update(agentRuns).set({
        status: "SUCCEEDED",
        outputJson: output,
        durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
        finishedAt,
        updatedAt: finishedAt
      }).where(eq2(agentRuns.id, runId));
      await this.recordZeroCost(runId, finishedAt);
      return {
        runId,
        status: "SUCCEEDED",
        cacheHit: false,
        output,
        idempotencyKey,
        promptHash
      };
    } catch (error) {
      const finishedAt = this.now();
      const code = failureCode(error);
      await this.db.update(agentRuns).set({
        status: code,
        errorCode: code,
        errorMessage: error instanceof Error ? error.message : "Unknown failure",
        durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
        finishedAt,
        updatedAt: finishedAt
      }).where(eq2(agentRuns.id, runId));
      await this.recordZeroCost(runId, finishedAt);
      throw error;
    }
  }
  async persistPrompt(job, contentHash) {
    const [existing] = await this.db.select().from(agentPrompts).where(
      and(
        eq2(agentPrompts.agentId, job.agentId),
        eq2(agentPrompts.name, job.prompt.name),
        eq2(agentPrompts.version, job.prompt.version)
      )
    ).limit(1);
    if (existing && existing.contentHash !== contentHash) {
      throw new Error(
        `Prompt ${job.agentId}/${job.prompt.name}@${job.prompt.version} is immutable`
      );
    }
    if (!existing) {
      await this.db.insert(agentPrompts).values({
        id: uuidv73(),
        agentId: job.agentId,
        name: job.prompt.name,
        version: job.prompt.version,
        contentHash,
        content: job.prompt.content,
        status: "ACTIVE"
      });
    }
  }
  async recordZeroCost(runId, occurredAt) {
    await this.db.insert(costEvents).values({
      id: uuidv73(),
      agentRunId: runId,
      provider: "none",
      model: "deterministic",
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: "0",
      occurredAt
    });
  }
};

// packages/config/src/index.ts
import { z } from "zod";
import { homedir } from "node:os";
import { join as join2 } from "node:path";
var nonNegativeUsd = (defaultValue) => z.coerce.number().finite().nonnegative().default(defaultValue);
var configSchema = z.object({
  DAILY_BUDGET_USD: nonNegativeUsd(1),
  MAX_COST_PER_RUN_USD: nonNegativeUsd(0.05),
  MAX_PROJECT_BUDGET_USD: nonNegativeUsd(5),
  DATABASE_PATH: z.string().min(1),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info")
}).transform((config, context) => {
  if (config.MAX_COST_PER_RUN_USD > config.DAILY_BUDGET_USD) {
    context.addIssue({
      code: "custom",
      message: "MAX_COST_PER_RUN_USD must not exceed DAILY_BUDGET_USD",
      path: ["MAX_COST_PER_RUN_USD"]
    });
    return z.NEVER;
  }
  return config;
});
function defaultDatabasePath(environment = process.env) {
  const dataHome = environment.LOCALAPPDATA ?? environment.XDG_DATA_HOME ?? join2(homedir(), ".local", "share");
  return join2(dataHome, "ase", "pglite");
}
function loadConfig(environment = process.env) {
  return configSchema.parse({
    ...environment,
    DATABASE_PATH: environment.DATABASE_PATH ?? defaultDatabasePath(environment)
  });
}

// packages/importer/src/index.ts
import { createHash as createHash3 } from "node:crypto";
import { eq as eq3 } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import { v7 as uuidv74 } from "uuid";
var IMPORTER_VERSION = "m1-csv-v1";
var M1_COLUMNS = [
  "rank",
  "niche",
  "keyword",
  "opportunity_score",
  "serp_opportunity",
  "reason",
  "research_priority"
];
function sha2562(value) {
  return createHash3("sha256").update(value).digest("hex");
}
function rawRecord(header, row) {
  const result = {};
  header.forEach((column, index2) => {
    result[column] = row[index2] ?? "";
  });
  if (row.length > header.length) {
    result._extra = row.slice(header.length).join(",");
  }
  return result;
}
function validateHeader(header) {
  if (header.length !== M1_COLUMNS.length || header.some((column, index2) => column !== M1_COLUMNS[index2])) {
    throw new Error(`Unexpected CSV columns: ${header.join(",")}`);
  }
}
async function importM1Csv(db, input) {
  const bytes = Buffer.isBuffer(input.content) ? input.content : Buffer.from(input.content, "utf8");
  const fileSha256 = sha2562(bytes);
  const [existingBatch] = await db.select().from(importBatches).where(eq3(importBatches.fileSha256, fileSha256)).limit(1);
  if (existingBatch?.importerVersion === IMPORTER_VERSION) {
    const rows = await db.select({ status: importRows.status }).from(importRows).where(eq3(importRows.batchId, existingBatch.id));
    return {
      batchId: existingBatch.id,
      fileSha256,
      rowCount: existingBatch.rowCount,
      acceptedCount: existingBatch.acceptedCount,
      rejectedCount: existingBatch.rejectedCount,
      duplicateCount: rows.filter((row) => row.status === "DUPLICATE").length,
      status: existingBatch.status === "PENDING" ? "FAILED" : existingBatch.status,
      reused: true
    };
  }
  let records;
  try {
    records = parse(bytes, {
      bom: true,
      relax_column_count: true,
      skip_empty_lines: true
    });
  } catch (error) {
    const [batch2] = await db.insert(importBatches).values({
      id: uuidv74(),
      sourcePath: input.sourcePath,
      fileSha256,
      importerVersion: IMPORTER_VERSION,
      rowCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      status: "FAILED",
      actor: input.actor ?? "system"
    }).returning();
    if (!batch2) throw error;
    return {
      batchId: batch2.id,
      fileSha256,
      rowCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      duplicateCount: 0,
      status: "FAILED",
      reused: false
    };
  }
  const header = records.shift() ?? [];
  validateHeader(header);
  const [batch] = await db.insert(importBatches).values({
    id: uuidv74(),
    sourcePath: input.sourcePath,
    fileSha256,
    importerVersion: IMPORTER_VERSION,
    rowCount: records.length,
    acceptedCount: 0,
    rejectedCount: 0,
    status: "PENDING",
    actor: input.actor ?? "system"
  }).returning();
  if (!batch) throw new Error("Import batch creation failed");
  const nicheRows = await db.select().from(niches);
  const aliasRows = await db.select().from(nicheAliases);
  const nicheByName = new Map(nicheRows.map((niche) => [niche.name, niche]));
  for (const alias of aliasRows) {
    const niche = nicheRows.find((candidate) => candidate.id === alias.nicheId);
    if (niche) nicheByName.set(alias.alias, niche);
  }
  let acceptedCount = 0;
  let rejectedCount = 0;
  let duplicateCount = 0;
  const keywordRepository = new KeywordRepository(db);
  for (const [index2, row] of records.entries()) {
    const rowNumber = index2 + 2;
    const raw = rawRecord(header, row);
    const rowHash = sha2562(JSON.stringify(row));
    const niche = nicheByName.get(raw.niche ?? "");
    const rawKeyword = raw.keyword ?? "";
    const score = Number(raw.opportunity_score);
    const rejectReason = row.length !== header.length ? `EXPECTED_${header.length}_COLUMNS_GOT_${row.length}` : !niche ? "UNKNOWN_NICHE" : !rawKeyword.trim() ? "MISSING_KEYWORD" : !Number.isFinite(score) || score < 0 || score > 100 ? "INVALID_OPPORTUNITY_SCORE" : !raw.serp_opportunity?.trim() ? "MISSING_SERP_LABEL" : null;
    if (rejectReason || !niche) {
      rejectedCount += 1;
      await db.insert(importRows).values({
        id: uuidv74(),
        batchId: batch.id,
        rowNumber,
        rawJson: raw,
        rowHash,
        status: "REJECTED",
        rejectReason: rejectReason ?? "UNKNOWN_NICHE"
      });
      continue;
    }
    const canonicalText = canonicalizeKeyword(rawKeyword);
    const canonicalHash = keywordCanonicalHash(
      canonicalText,
      niche.market,
      niche.language
    );
    const [before] = await db.select({ id: keywords.id }).from(keywords).where(eq3(keywords.canonicalHash, canonicalHash)).limit(1);
    const keyword = await keywordRepository.insertCanonical({
      nicheId: niche.id,
      firstSeenImportBatchId: batch.id,
      rawText: rawKeyword,
      market: niche.market,
      locale: niche.language
    });
    const rowStatus = before ? "DUPLICATE" : "ACCEPTED";
    if (before) duplicateCount += 1;
    else acceptedCount += 1;
    await db.insert(importRows).values({
      id: uuidv74(),
      batchId: batch.id,
      rowNumber,
      rawJson: raw,
      rowHash,
      status: rowStatus,
      rejectReason: null,
      keywordId: keyword.id
    });
    await db.insert(keywordMetrics).values([
      {
        id: uuidv74(),
        keywordId: keyword.id,
        metricName: "M1_HYPOTHESIS_SCORE",
        numericValue: score.toFixed(3),
        textValue: null,
        sourceType: "HYPOTHESIS",
        sourceName: "m1-csv",
        sourceRef: `${batch.id}:${rowNumber}`,
        confidence: null,
        valueStatus: "PRESENT"
      },
      {
        id: uuidv74(),
        keywordId: keyword.id,
        metricName: "M1_HYPOTHESIS_SERP_LABEL",
        numericValue: null,
        textValue: raw.serp_opportunity,
        sourceType: "HYPOTHESIS",
        sourceName: "m1-csv",
        sourceRef: `${batch.id}:${rowNumber}`,
        confidence: null,
        valueStatus: "PRESENT"
      }
    ]).onConflictDoNothing();
  }
  const status = rejectedCount > 0 ? "PARTIAL" : "COMPLETE";
  await db.update(importBatches).set({ acceptedCount, rejectedCount, status, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(importBatches.id, batch.id));
  return {
    batchId: batch.id,
    fileSha256,
    rowCount: records.length,
    acceptedCount,
    rejectedCount,
    duplicateCount,
    status,
    reused: false
  };
}

// packages/guardrails/src/index.ts
var DEFAULT_BANNED_EXPERIENCE_PHRASES = [
  "we tested",
  "we personally tested",
  "our testing",
  "in our tests",
  "hands-on testing"
];
var FabricationGuardrailError = class extends Error {
  constructor(code, evidence) {
    super(`${code}: ${evidence}`);
    this.code = code;
    this.evidence = evidence;
    this.name = "FabricationGuardrailError";
  }
  code;
  evidence;
};
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function containsPhrase(text2, phrase) {
  const pattern = escapeRegExp(phrase.trim()).replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${pattern}(?=$|[^\\p{L}\\p{N}])`, "iu").test(
    text2
  );
}
function canonicalNumericToken(token) {
  const hasPercent = token.endsWith("%");
  const numeric2 = token.replaceAll(",", "").replace(/%$/, "");
  const value = Number(numeric2);
  if (!Number.isFinite(value)) {
    throw new TypeError(`Unparseable numeric token: ${token}`);
  }
  return `${Object.is(value, -0) ? 0 : value}${hasPercent ? "%" : ""}`;
}
function extractNumericTokens(text2) {
  const matches = text2.match(
    /(?<![\p{L}\p{N}])[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?(?![\p{L}\p{N}])/gu
  );
  return new Set((matches ?? []).map(canonicalNumericToken));
}
function checkFabrication(input) {
  const phrases = input.bannedExperiencePhrases ?? DEFAULT_BANNED_EXPERIENCE_PHRASES;
  const output = input.outputTexts.join("\n");
  for (const phrase of phrases) {
    if (phrase.trim().length === 0) {
      throw new TypeError("Banned experience phrases must not be empty");
    }
    if (containsPhrase(output, phrase)) {
      return {
        ok: false,
        code: "FABRICATED_EXPERIENCE",
        evidence: phrase
      };
    }
  }
  const inputNumbers = extractNumericTokens(input.inputTexts.join("\n"));
  for (const number of extractNumericTokens(output)) {
    if (!inputNumbers.has(number)) {
      return {
        ok: false,
        code: "FABRICATED_NUMERIC",
        evidence: number
      };
    }
  }
  return { ok: true };
}
function assertNoFabrication(input) {
  const result = checkFabrication(input);
  if (!result.ok) {
    throw new FabricationGuardrailError(result.code, result.evidence);
  }
}

// packages/schemas/src/index.ts
import { z as z2 } from "zod";
var sourceTypeSchema = z2.enum([
  "MEASURED",
  "HYPOTHESIS",
  "DERIVED",
  "MANUAL",
  "UNAVAILABLE"
]);
var valueStatusSchema = z2.enum([
  "PRESENT",
  "UNAVAILABLE",
  "CONTRADICTED",
  "STALE"
]);
var provenanceSchema = z2.object({
  sourceType: sourceTypeSchema,
  sourceName: z2.string().min(1),
  sourceUrl: z2.url().nullable(),
  sourceRef: z2.string().min(1).nullable(),
  confidence: z2.number().min(0).max(1).nullable(),
  valueStatus: valueStatusSchema,
  observedAt: z2.iso.datetime().nullable(),
  agentRunId: z2.uuid().nullable()
}).strict();
var metricNameSchema = z2.enum([
  "M1_HYPOTHESIS_SCORE",
  "M1_HYPOTHESIS_SERP_LABEL",
  "M1_SOURCE_RANK",
  "M1_RESEARCH_PRIORITY",
  "search_volume"
]);
var keywordMetricSchema = z2.object({
  keywordId: z2.uuid(),
  metricName: metricNameSchema,
  numericValue: z2.number().nullable(),
  textValue: z2.string().nullable(),
  provenance: provenanceSchema
}).strict();
var importRowSchema = z2.object({
  rowNumber: z2.number().int().positive(),
  raw: z2.record(z2.string(), z2.string()),
  rowHash: z2.string().regex(/^[a-f0-9]{64}$/),
  status: z2.enum(["ACCEPTED", "REJECTED", "DUPLICATE"]),
  rejectReason: z2.string().nullable(),
  keywordId: z2.uuid().nullable()
}).strict();
var patternTypeSchema = z2.enum([
  "BEST_X_FOR_Y",
  "BEST_ATTRIBUTE_X",
  "X_VS_Y",
  "BEST_X_UNDER_PRICE",
  "HOW_TO_CHOOSE_X",
  "BUYING_GUIDE",
  "OTHER"
]);
var intentTypeSchema = z2.enum([
  "COMMERCIAL_INVESTIGATION",
  "TRANSACTIONAL",
  "INFORMATIONAL",
  "MIXED",
  "UNKNOWN"
]);
var facetSchema = z2.object({
  kind: z2.enum([
    "PRODUCT",
    "USER",
    "PROBLEM",
    "ENVIRONMENT",
    "USE_CASE",
    "CONSTRAINT",
    "ATTRIBUTE"
  ]),
  slug: z2.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z2.string().min(1),
  confidence: z2.number().min(0).max(1)
}).strict();
var keywordAnalysisSchema = z2.object({
  patternType: patternTypeSchema,
  intentType: intentTypeSchema,
  productText: z2.string().min(1).nullable(),
  qualifierText: z2.string().min(1).nullable(),
  facets: z2.array(facetSchema),
  userText: z2.string().min(1).nullable(),
  problemText: z2.string().min(1).nullable(),
  environmentText: z2.string().min(1).nullable(),
  constraintText: z2.string().min(1).nullable(),
  clusterSuggestion: z2.object({ slug: z2.string().min(1), label: z2.string().min(1) }).strict().nullable(),
  relatedCandidates: z2.array(
    z2.object({
      text: z2.string().min(1),
      origin: z2.enum(["TEMPLATE", "LEXICON", "LLM"]),
      confidence: z2.number().min(0).max(0.5)
    }).strict()
  ),
  confidence: z2.number().min(0).max(1),
  path: z2.enum(["DETERMINISTIC", "DETERMINISTIC_PLUS_LLM", "LLM"]),
  notes: z2.array(z2.string())
}).strict();
var opportunityScoreSchema = z2.object({
  scoreKind: z2.literal("OPPORTUNITY_SCORE"),
  modelId: z2.literal("opportunity-v1"),
  modelVersion: z2.string().min(1),
  score: z2.number().min(0).max(100).nullable(),
  band: z2.enum([
    "PROVISIONAL_HIGH",
    "PROVISIONAL_MEDIUM",
    "PROVISIONAL_LOW",
    "INSUFFICIENT_DATA"
  ]),
  dataCompleteness: z2.number().min(0).max(1),
  components: z2.record(z2.string(), z2.number()),
  missingInputs: z2.array(z2.string())
}).strict();
var reportSchema = z2.object({
  generatedAt: z2.iso.datetime(),
  niche: z2.string().min(1),
  keywords: z2.array(
    z2.object({
      keyword: z2.string().min(1),
      opportunityScore: opportunityScoreSchema,
      m1HypothesisScore: z2.number().nullable(),
      m1SerpLabel: z2.string().nullable()
    }).strict()
  ),
  totalEstimatedCostUsd: z2.number().nonnegative(),
  llmCalls: z2.number().int().nonnegative()
}).strict();

// packages/keyword-agent/src/index.ts
import { and as and2, eq as eq4 } from "drizzle-orm";
import { v7 as uuidv75 } from "uuid";
import { z as z3 } from "zod";
var inputSchema = z3.object({ keywordId: z3.uuid(), keyword: z3.string().min(1) }).strict();
function slugify(value) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function qualifierFacet(value) {
  if (value === "lightweight") {
    return { kind: "ATTRIBUTE", slug: "lightweight", label: value };
  }
  if (value.includes("beginner")) {
    return { kind: "USER", slug: "beginners", label: value };
  }
  if (value.includes("elderly")) {
    return { kind: "USER", slug: "elderly", label: value };
  }
  if (value.includes("small hands")) {
    return { kind: "CONSTRAINT", slug: "small-hands", label: value };
  }
  if (value.includes("tomato")) {
    return { kind: "USE_CASE", slug: "tomatoes", label: value };
  }
  return {
    kind: "ENVIRONMENT",
    slug: slugify(value),
    label: value
  };
}
function analyzeKeyword(keyword) {
  const normalized = keyword.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
  let patternType2 = "OTHER";
  let productText = null;
  let qualifierText = null;
  const attributeMatch = /^best (lightweight) (.+)$/.exec(normalized);
  const forMatch = /^best (.+) for (.+)$/.exec(normalized);
  if (attributeMatch) {
    patternType2 = "BEST_ATTRIBUTE_X";
    qualifierText = attributeMatch[1] ?? null;
    productText = attributeMatch[2] ?? null;
  } else if (forMatch) {
    patternType2 = "BEST_X_FOR_Y";
    productText = forMatch[1] ?? null;
    qualifierText = forMatch[2] ?? null;
  }
  const productFacet = productText ? {
    kind: "PRODUCT",
    slug: slugify(productText),
    label: productText,
    confidence: 0.95
  } : null;
  const qualifier = qualifierText ? qualifierFacet(qualifierText) : null;
  const clusterSuggestion = normalized.includes("tomato") && (normalized.includes("trellis") || normalized.includes("plant support")) ? { slug: "tomato-support", label: "Tomato support" } : productText ? { slug: slugify(productText), label: productText } : null;
  return keywordAnalysisSchema.parse({
    patternType: patternType2,
    intentType: patternType2 === "OTHER" ? "UNKNOWN" : "COMMERCIAL_INVESTIGATION",
    productText,
    qualifierText,
    facets: [
      ...productFacet ? [productFacet] : [],
      ...qualifier ? [{ ...qualifier, confidence: 0.9 }] : []
    ],
    userText: qualifier?.kind === "USER" ? qualifierText : null,
    problemText: null,
    environmentText: qualifier?.kind === "ENVIRONMENT" ? qualifierText : null,
    constraintText: qualifier?.kind === "CONSTRAINT" || qualifier?.kind === "ATTRIBUTE" ? qualifierText : null,
    clusterSuggestion,
    relatedCandidates: productText ? [
      {
        text: `${productText} buying guide`,
        origin: "TEMPLATE",
        confidence: 0.4
      }
    ] : [],
    confidence: patternType2 === "OTHER" ? 0.35 : 0.9,
    path: "DETERMINISTIC",
    notes: patternType2 === "OTHER" ? ["No supported grammar matched"] : []
  });
}
var analysisJob = {
  agentId: "keyword",
  agentVersion: "1.0.0",
  prompt: {
    name: "deterministic-keyword-analysis",
    version: "1",
    content: "Apply the versioned BEST_X_FOR_Y and BEST_ATTRIBUTE_X grammar and lexicon."
  },
  inputSchema,
  outputSchema: keywordAnalysisSchema,
  execute: ({ keyword }) => analyzeKeyword(keyword),
  guard: (input, output) => {
    assertNoFabrication({
      inputTexts: [input.keyword],
      outputTexts: [
        output.productText ?? "",
        output.qualifierText ?? "",
        ...output.relatedCandidates.map((candidate) => candidate.text)
      ]
    });
  }
};
async function analyzeNicheKeywords(db, nicheSlug, budgetCaps) {
  const nicheKeywords = await db.select({ keyword: keywords, niche: niches }).from(keywords).innerJoin(niches, eq4(keywords.nicheId, niches.id)).where(eq4(niches.slug, nicheSlug));
  const runner = new AgentRunner(db, { budgetCaps });
  let cacheHits = 0;
  for (const item of nicheKeywords) {
    const run = await runner.run(analysisJob, {
      keywordId: item.keyword.id,
      keyword: item.keyword.canonicalText
    });
    if (run.cacheHit) cacheHits += 1;
    const output = run.output;
    await db.insert(keywordAnalyses).values({
      id: uuidv75(),
      keywordId: item.keyword.id,
      patternType: output.patternType,
      intentType: output.intentType,
      productText: output.productText,
      qualifierText: output.qualifierText,
      userText: output.userText,
      problemText: output.problemText,
      environmentText: output.environmentText,
      constraintText: output.constraintText,
      confidence: output.confidence.toFixed(3),
      path: output.path,
      relatedCandidates: output.relatedCandidates,
      rawOutput: output,
      agentRunId: run.runId
    }).onConflictDoNothing();
    for (const outputFacet of output.facets) {
      const [facet] = await db.insert(facets).values({
        id: uuidv75(),
        kind: outputFacet.kind,
        slug: outputFacet.slug,
        label: outputFacet.label,
        synonyms: [outputFacet.label]
      }).onConflictDoUpdate({
        target: facets.slug,
        set: { updatedAt: /* @__PURE__ */ new Date() }
      }).returning();
      if (facet) {
        await db.insert(keywordFacets).values({
          id: uuidv75(),
          keywordId: item.keyword.id,
          facetId: facet.id,
          role: outputFacet.kind,
          agentRunId: run.runId
        }).onConflictDoNothing();
      }
    }
    if (output.clusterSuggestion) {
      const [cluster] = await db.insert(keywordClusters).values({
        id: uuidv75(),
        nicheId: item.niche.id,
        slug: output.clusterSuggestion.slug,
        label: output.clusterSuggestion.label,
        method: "deterministic-grammar",
        methodVersion: "1.0.0"
      }).onConflictDoUpdate({
        target: [keywordClusters.nicheId, keywordClusters.slug],
        set: { updatedAt: /* @__PURE__ */ new Date() }
      }).returning();
      if (cluster) {
        const [existingPrimary] = await db.select({ id: keywordClusterMembers.id }).from(keywordClusterMembers).where(eq4(keywordClusterMembers.clusterId, cluster.id)).limit(1);
        await db.insert(keywordClusterMembers).values({
          id: uuidv75(),
          clusterId: cluster.id,
          keywordId: item.keyword.id,
          isPrimary: !existingPrimary
        }).onConflictDoNothing();
      }
    }
    await db.update(keywords).set({ status: "ANALYZED", updatedAt: /* @__PURE__ */ new Date() }).where(
      and2(
        eq4(keywords.id, item.keyword.id),
        eq4(keywords.nicheId, item.niche.id)
      )
    );
  }
  return { analyzedCount: nicheKeywords.length, cacheHits };
}

// packages/pipeline/src/index.ts
import { mkdir, writeFile } from "node:fs/promises";
import { join as join3 } from "node:path";

// packages/scoring/src/index.ts
import { eq as eq5 } from "drizzle-orm";
import { v7 as uuidv76 } from "uuid";
import { z as z4 } from "zod";
var OPPORTUNITY_MODEL_VERSION = "1.0.0";
var MISSING_COMMERCIAL_INPUTS = [
  "search_volume",
  "keyword_difficulty",
  "cpc",
  "serp_retrieved",
  "aov_or_commission"
];
var scoringInputSchema = z4.object({
  keywordId: z4.uuid(),
  patternType: z4.enum([
    "BEST_X_FOR_Y",
    "BEST_ATTRIBUTE_X",
    "X_VS_Y",
    "BEST_X_UNDER_PRICE",
    "HOW_TO_CHOOSE_X",
    "BUYING_GUIDE",
    "OTHER"
  ]),
  intentType: z4.enum([
    "COMMERCIAL_INVESTIGATION",
    "TRANSACTIONAL",
    "INFORMATIONAL",
    "MIXED",
    "UNKNOWN"
  ]),
  hasQualifier: z4.boolean(),
  facetCount: z4.number().int().nonnegative(),
  clusterSize: z4.number().int().positive(),
  analysisConfidence: z4.number().min(0).max(1),
  nicheActive: z4.boolean()
}).strict();
function commercialIntent(intent) {
  if (intent === "COMMERCIAL_INVESTIGATION" || intent === "TRANSACTIONAL") {
    return 1;
  }
  if (intent === "MIXED") return 0.6;
  if (intent === "INFORMATIONAL") return 0.3;
  return 0.2;
}
function specificity(input) {
  const qualifier = input.hasQualifier ? 0.4 : 0;
  const facets2 = Math.min(0.4, input.facetCount * 0.2);
  const grammar = input.patternType === "BEST_X_FOR_Y" || input.patternType === "BEST_ATTRIBUTE_X" ? 0.2 : 0;
  return Math.min(1, qualifier + facets2 + grammar);
}
function calculateOpportunityScore(input) {
  const components = {
    specificity: specificity(input),
    commercial_intent: commercialIntent(input.intentType),
    cluster_support: Math.min(1, (input.clusterSize - 1) / 4),
    extraction_ok: input.analysisConfidence,
    niche_fit: input.nicheActive ? 1 : 0
  };
  const raw = 0.35 * components.specificity + 0.3 * components.commercial_intent + 0.15 * components.cluster_support + 0.15 * components.extraction_ok + 0.05 * components.niche_fit;
  const score = Math.round(raw * 1e5) / 1e3;
  const band = score >= 70 ? "PROVISIONAL_HIGH" : score >= 50 ? "PROVISIONAL_MEDIUM" : "PROVISIONAL_LOW";
  return opportunityScoreSchema.parse({
    scoreKind: "OPPORTUNITY_SCORE",
    modelId: "opportunity-v1",
    modelVersion: OPPORTUNITY_MODEL_VERSION,
    score,
    band,
    dataCompleteness: 0.4,
    components,
    missingInputs: [...MISSING_COMMERCIAL_INPUTS]
  });
}
var scoringJob = {
  agentId: "scoring",
  agentVersion: OPPORTUNITY_MODEL_VERSION,
  prompt: {
    name: "opportunity-v1",
    version: OPPORTUNITY_MODEL_VERSION,
    content: "Apply approved opportunity-v1 analysis-only weights. Never use M1 hypotheses or invent commercial metrics."
  },
  inputSchema: scoringInputSchema,
  outputSchema: opportunityScoreSchema,
  execute: calculateOpportunityScore
};
async function scoreNicheKeywords(db, nicheSlug, budgetCaps) {
  const rows = await db.select({ keyword: keywords, analysis: keywordAnalyses, niche: niches }).from(keywords).innerJoin(keywordAnalyses, eq5(keywordAnalyses.keywordId, keywords.id)).innerJoin(niches, eq5(niches.id, keywords.nicheId)).where(eq5(niches.slug, nicheSlug));
  const runner = new AgentRunner(db, { budgetCaps });
  let cacheHits = 0;
  for (const row of rows) {
    const facetRows = await db.select({ id: keywordFacets.id }).from(keywordFacets).where(eq5(keywordFacets.keywordId, row.keyword.id));
    const memberships = await db.select({ clusterId: keywordClusterMembers.clusterId }).from(keywordClusterMembers).where(eq5(keywordClusterMembers.keywordId, row.keyword.id));
    let clusterSize = 1;
    const membership = memberships[0];
    if (membership) {
      const members = await db.select({ id: keywordClusterMembers.id }).from(keywordClusterMembers).where(eq5(keywordClusterMembers.clusterId, membership.clusterId));
      clusterSize = members.length;
    }
    const run = await runner.run(scoringJob, {
      keywordId: row.keyword.id,
      patternType: row.analysis.patternType,
      intentType: row.analysis.intentType,
      hasQualifier: row.analysis.qualifierText !== null,
      facetCount: facetRows.length,
      clusterSize,
      analysisConfidence: Number(row.analysis.confidence),
      nicheActive: row.niche.status === "ACTIVE"
    });
    if (run.cacheHit) cacheHits += 1;
    const output = run.output;
    await db.insert(keywordScores).values({
      id: uuidv76(),
      keywordId: row.keyword.id,
      scoreKind: output.scoreKind,
      modelId: output.modelId,
      modelVersion: output.modelVersion,
      score: output.score?.toFixed(3) ?? null,
      band: output.band,
      dataCompleteness: output.dataCompleteness.toFixed(3),
      components: output.components,
      missingInputs: output.missingInputs,
      agentRunId: run.runId
    }).onConflictDoNothing();
    await db.update(keywords).set({ status: "SCORED", updatedAt: /* @__PURE__ */ new Date() }).where(eq5(keywords.id, row.keyword.id));
  }
  return { scoredCount: rows.length, cacheHits };
}

// packages/pipeline/src/index.ts
import { and as and3, eq as eq6, inArray } from "drizzle-orm";
import { stringify } from "csv-stringify/sync";
var REPORT_SCHEMA_VERSION = "1.0.0";
var DEFAULT_NICHE = "problem-solving-gardening";
async function buildReport(db, nicheSlug, summary) {
  const nicheKeywords = await db.select({ keyword: keywords }).from(keywords).innerJoin(niches, eq6(keywords.nicheId, niches.id)).where(eq6(niches.slug, nicheSlug));
  const keywordIds = nicheKeywords.map(({ keyword }) => keyword.id);
  const analyses = keywordIds.length === 0 ? [] : await db.select().from(keywordAnalyses).where(inArray(keywordAnalyses.keywordId, keywordIds));
  const scores = keywordIds.length === 0 ? [] : await db.select().from(keywordScores).where(
    and3(
      inArray(keywordScores.keywordId, keywordIds),
      eq6(keywordScores.scoreKind, "OPPORTUNITY_SCORE")
    )
  );
  const metrics = keywordIds.length === 0 ? [] : await db.select().from(keywordMetrics).where(inArray(keywordMetrics.keywordId, keywordIds));
  const rows = nicheKeywords.map(({ keyword }) => {
    const analysis = analyses.find((item) => item.keywordId === keyword.id);
    const score = scores.find((item) => item.keywordId === keyword.id);
    const hypothesis = metrics.find(
      (item) => item.keywordId === keyword.id && item.metricName === "M1_HYPOTHESIS_SCORE"
    );
    const serpLabel = metrics.find(
      (item) => item.keywordId === keyword.id && item.metricName === "M1_HYPOTHESIS_SERP_LABEL"
    );
    if (!analysis || !score || score.score === null || !hypothesis?.numericValue) {
      return null;
    }
    if (hypothesis.sourceType !== "HYPOTHESIS") {
      throw new Error(
        `M1_HYPOTHESIS_SCORE has invalid source_type ${hypothesis.sourceType}`
      );
    }
    return {
      keyword: keyword.canonicalText,
      analysis: {
        pattern_type: analysis.patternType,
        intent_type: analysis.intentType,
        path: "DETERMINISTIC"
      },
      provisional_opportunity_score: {
        score_kind: "OPPORTUNITY_SCORE",
        label: "PROVISIONAL_OPPORTUNITY_SCORE",
        model_id: "opportunity-v1",
        score: Number(score.score),
        band: score.band,
        missing_inputs: score.missingInputs
      },
      m1_hypothesis: {
        metric_name: "M1_HYPOTHESIS_SCORE",
        source_type: "HYPOTHESIS",
        score: Number(hypothesis.numericValue),
        serp_label: serpLabel?.textValue ?? null
      }
    };
  }).filter((row) => row !== null).sort((a, b) => a.keyword.localeCompare(b.keyword));
  const costs = await db.select().from(costEvents);
  const runs = await db.select().from(agentRuns);
  return {
    schema_version: REPORT_SCHEMA_VERSION,
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    niche: nicheSlug,
    summary,
    keywords: rows,
    total_estimated_cost_usd: costs.reduce(
      (total, event) => total + Number(event.estimatedCostUsd),
      0
    ),
    llm_calls: runs.filter((run) => run.model !== "deterministic").length
  };
}
function reportToCsv(report) {
  return stringify(
    report.keywords.map((row) => ({
      keyword: row.keyword,
      provisional_opportunity_score: row.provisional_opportunity_score.score,
      opportunity_score_kind: row.provisional_opportunity_score.score_kind,
      opportunity_score_band: row.provisional_opportunity_score.band,
      missing_inputs: row.provisional_opportunity_score.missing_inputs.join("|"),
      m1_hypothesis_score: row.m1_hypothesis.score,
      m1_hypothesis_source_type: row.m1_hypothesis.source_type,
      m1_hypothesis_serp_label: row.m1_hypothesis.serp_label ?? "",
      analysis_pattern_type: row.analysis.pattern_type,
      analysis_path: row.analysis.path
    })),
    { header: true }
  );
}
function reportToMarkdown(report) {
  const summary = report.summary;
  const keywordRows = report.keywords.map(
    (row) => `| ${row.keyword} | ${row.provisional_opportunity_score.score.toFixed(3)} (${row.provisional_opportunity_score.band}) | ${row.m1_hypothesis.score.toFixed(3)} (HYPOTHESIS) |`
  ).join("\n");
  return `# M2 keyword report

The **PROVISIONAL_OPPORTUNITY_SCORE** is deterministic and incomplete. The **M1_HYPOTHESIS_SCORE** and M1 SERP label have \`source_type=HYPOTHESIS\`; they are not measured SEO data. No search volume, traffic, or live SERP data is claimed.

## Pipeline summary

- Imported: ${summary.imported}
- Rejected: ${summary.rejected}
- Duplicates: ${summary.duplicates}
- Analyzed: ${summary.analyzed}
- Clustered: ${summary.clustered}
- Scored: ${summary.scored}
- Errors: ${summary.errors.length}
- Total estimated cost USD: ${report.total_estimated_cost_usd}
- LLM calls: ${report.llm_calls}

## Keywords

| Keyword | PROVISIONAL_OPPORTUNITY_SCORE | M1_HYPOTHESIS_SCORE |
|---|---:|---:|
${keywordRows}
`;
}
async function writeReportArtifacts(report, outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  const artifacts = {
    jsonPath: join3(outputDirectory, "m2-keyword-report.json"),
    csvPath: join3(outputDirectory, "m2-keyword-report.csv"),
    markdownPath: join3(outputDirectory, "m2-keyword-report.md")
  };
  await Promise.all([
    writeFile(artifacts.jsonPath, `${JSON.stringify(report, null, 2)}
`, "utf8"),
    writeFile(artifacts.csvPath, reportToCsv(report), "utf8"),
    writeFile(artifacts.markdownPath, reportToMarkdown(report), "utf8")
  ]);
  return artifacts;
}
async function runPipeline(db, input) {
  const niche = input.niche ?? DEFAULT_NICHE;
  const importResult = await importM1Csv(db, {
    content: input.content,
    sourcePath: input.sourcePath,
    actor: "pipeline"
  });
  if (importResult.status === "FAILED") {
    throw new Error("Import failed");
  }
  const analysis = await analyzeNicheKeywords(db, niche, input.budgetCaps);
  const scoring = await scoreNicheKeywords(db, niche, input.budgetCaps);
  const nicheKeywordIds = (await db.select({ id: keywords.id }).from(keywords).innerJoin(niches, eq6(keywords.nicheId, niches.id)).where(eq6(niches.slug, niche))).map((row) => row.id);
  const memberships = nicheKeywordIds.length === 0 ? [] : await db.select({ keywordId: keywordClusterMembers.keywordId }).from(keywordClusterMembers).where(inArray(keywordClusterMembers.keywordId, nicheKeywordIds));
  const report = await buildReport(db, niche, {
    imported: importResult.acceptedCount,
    rejected: importResult.rejectedCount,
    duplicates: importResult.duplicateCount,
    analyzed: analysis.analyzedCount,
    clustered: new Set(memberships.map((item) => item.keywordId)).size,
    scored: scoring.scoredCount,
    errors: []
  });
  const artifacts = input.outputDirectory ? await writeReportArtifacts(report, input.outputDirectory) : null;
  return { importResult, report, artifacts };
}

// apps/cli/src/index.ts
import { PGlite as PGlite2 } from "@electric-sql/pglite";
var usage = `Automated SEO Engine (ase)

Usage:
  ase --help
  ase db migrate
  ase db seed
  ase import --file <csv>
  ase analyze [--niche <slug>]
  ase score [--niche <slug>]
  ase pipeline --file <csv> [--niche <slug>] [--out <directory>]
  ase pipeline import-and-score <csv> [--out <directory>]

The default PGlite database is stored in the OS local application-data directory.
Set DATABASE_PATH to override it.`;
function option(args, name) {
  const index2 = args.indexOf(name);
  return index2 >= 0 ? args[index2 + 1] : void 0;
}
function requiredFile(args) {
  const aliasIndex = args.indexOf("import-and-score");
  const value = option(args, "--file") ?? (aliasIndex >= 0 ? args[aliasIndex + 1] : void 0) ?? (args[0] && !args[0].startsWith("-") ? args[0] : void 0);
  if (!value) throw new Error("A CSV path is required (--file <csv>)");
  return resolve(value);
}
async function withDatabase(callback) {
  const config = loadConfig();
  await mkdir2(dirname(config.DATABASE_PATH), { recursive: true });
  const client = new PGlite2(config.DATABASE_PATH);
  await client.waitReady;
  try {
    return await callback(client);
  } finally {
    await client.close();
  }
}
function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}
`);
}
async function main() {
  const [command, subcommand, ...rest] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(`${usage}
`);
    return;
  }
  const config = loadConfig();
  const caps = budgetCapsFromConfig(config);
  if (command === "db" && subcommand === "migrate") {
    await withDatabase(async (client) => migrate(client));
    print({ command: "db migrate", status: "ok", database_path: config.DATABASE_PATH });
    return;
  }
  if (command === "db" && subcommand === "seed") {
    await withDatabase(async (client) => seed(createDatabase(client)));
    print({ command: "db seed", status: "ok", database_path: config.DATABASE_PATH });
    return;
  }
  if (command === "import") {
    const args = [subcommand, ...rest].filter(
      (value) => value !== void 0
    );
    const filePath = requiredFile(args);
    const content = await readFile2(filePath);
    const result = await withDatabase(
      (client) => importM1Csv(createDatabase(client), {
        content,
        sourcePath: filePath,
        actor: "cli"
      })
    );
    print(result);
    if (result.status === "PARTIAL") process.exitCode = 1;
    return;
  }
  if (command === "analyze" || command === "score") {
    const args = [subcommand, ...rest].filter(
      (value) => value !== void 0
    );
    const niche = option(args, "--niche") ?? DEFAULT_NICHE;
    if (command === "analyze") {
      const result = await withDatabase(
        (client) => analyzeNicheKeywords(createDatabase(client), niche, caps)
      );
      print({ command, niche, ...result });
    } else {
      const result = await withDatabase(
        (client) => scoreNicheKeywords(createDatabase(client), niche, caps)
      );
      print({ command, niche, ...result });
    }
    return;
  }
  if (command === "pipeline") {
    const args = [subcommand, ...rest].filter(
      (value) => value !== void 0
    );
    const filePath = requiredFile(args);
    const niche = option(args, "--niche") ?? DEFAULT_NICHE;
    const outputDirectory = resolve(option(args, "--out") ?? "reports/m2-latest");
    const content = await readFile2(filePath);
    const result = await withDatabase(
      (client) => runPipeline(createDatabase(client), {
        content,
        sourcePath: filePath,
        niche,
        outputDirectory,
        budgetCaps: caps
      })
    );
    print({
      status: result.importResult.status,
      reused_import: result.importResult.reused,
      summary: result.report.summary,
      total_estimated_cost_usd: result.report.total_estimated_cost_usd,
      llm_calls: result.report.llm_calls,
      artifacts: result.artifacts
    });
    if (result.importResult.status === "PARTIAL") process.exitCode = 1;
    return;
  }
  throw new Error("Unknown command. Run ase --help.");
}
main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Unknown CLI failure"}
`
  );
  process.exitCode = 2;
});
