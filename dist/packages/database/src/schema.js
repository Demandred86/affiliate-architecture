import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, } from "drizzle-orm/pg-core";
export const nicheStatus = pgEnum("niche_status", ["ACTIVE", "PARKED"]);
export const keywordStatus = pgEnum("keyword_status", [
    "IMPORTED",
    "ANALYZED",
    "SCORED",
    "PARKED",
    "REJECTED",
]);
export const importBatchStatus = pgEnum("import_batch_status", [
    "PENDING",
    "COMPLETE",
    "PARTIAL",
    "FAILED",
]);
export const importRowStatus = pgEnum("import_row_status", [
    "ACCEPTED",
    "REJECTED",
    "DUPLICATE",
]);
export const sourceType = pgEnum("source_type", [
    "MEASURED",
    "HYPOTHESIS",
    "DERIVED",
    "MANUAL",
    "UNAVAILABLE",
]);
export const valueStatus = pgEnum("value_status", [
    "PRESENT",
    "UNAVAILABLE",
    "CONTRADICTED",
    "STALE",
]);
export const facetKind = pgEnum("facet_kind", [
    "PRODUCT",
    "USER",
    "PROBLEM",
    "ENVIRONMENT",
    "USE_CASE",
    "CONSTRAINT",
    "ATTRIBUTE",
]);
export const intentType = pgEnum("intent_type", [
    "COMMERCIAL_INVESTIGATION",
    "TRANSACTIONAL",
    "INFORMATIONAL",
    "MIXED",
    "UNKNOWN",
]);
export const patternType = pgEnum("pattern_type", [
    "BEST_X_FOR_Y",
    "BEST_ATTRIBUTE_X",
    "X_VS_Y",
    "BEST_X_UNDER_PRICE",
    "HOW_TO_CHOOSE_X",
    "BUYING_GUIDE",
    "OTHER",
]);
export const scoreBand = pgEnum("score_band", [
    "PROVISIONAL_HIGH",
    "PROVISIONAL_MEDIUM",
    "PROVISIONAL_LOW",
    "INSUFFICIENT_DATA",
]);
export const agentRunStatus = pgEnum("agent_run_status", [
    "QUEUED",
    "RUNNING",
    "SUCCEEDED",
    "INVALID_OUTPUT",
    "FABRICATED_NUMERIC",
    "FABRICATED_EXPERIENCE",
    "BUDGET_EXCEEDED",
    "FAILED",
    "CACHED",
]);
const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
};
export const niches = pgTable("niche", {
    id: uuid("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    status: nicheStatus("status").notNull(),
    market: text("market").notNull(),
    language: text("language").notNull(),
    ...timestamps,
}, (table) => [
    index("niche_market_language_idx").on(table.market, table.language),
]);
export const nicheAliases = pgTable("niche_alias", {
    id: uuid("id").primaryKey(),
    nicheId: uuid("niche_id")
        .notNull()
        .references(() => niches.id),
    alias: text("alias").notNull().unique(),
    ...timestamps,
});
export const importBatches = pgTable("import_batch", {
    id: uuid("id").primaryKey(),
    sourcePath: text("source_path").notNull(),
    fileSha256: text("file_sha256").notNull(),
    importerVersion: text("importer_version").notNull(),
    rowCount: integer("row_count").notNull(),
    acceptedCount: integer("accepted_count").notNull().default(0),
    rejectedCount: integer("rejected_count").notNull().default(0),
    status: importBatchStatus("status").notNull(),
    actor: text("actor").notNull(),
    ...timestamps,
}, (table) => [
    uniqueIndex("import_batch_file_version_uq").on(table.fileSha256, table.importerVersion),
]);
export const agentPrompts = pgTable("agent_prompt", {
    id: uuid("id").primaryKey(),
    agentId: text("agent_id").notNull(),
    name: text("name").notNull(),
    version: text("version").notNull(),
    contentHash: text("content_hash").notNull(),
    content: text("content").notNull(),
    status: text("status").notNull(),
    ...timestamps,
}, (table) => [
    uniqueIndex("agent_prompt_identity_uq").on(table.agentId, table.name, table.version),
]);
export const agentRuns = pgTable("agent_run", {
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
        scale: 6,
    }).notNull(),
    durationMs: integer("duration_ms").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    parentRunId: uuid("parent_run_id"),
    traceId: text("trace_id").notNull(),
    ...timestamps,
}, (table) => [
    check("agent_run_cost_nonnegative", sql `${table.estimatedCostUsd} >= 0`),
]);
export const keywords = pgTable("keyword", {
    id: uuid("id").primaryKey(),
    nicheId: uuid("niche_id")
        .notNull()
        .references(() => niches.id),
    rawText: text("raw_text").notNull(),
    canonicalText: text("canonical_text").notNull(),
    canonicalHash: text("canonical_hash").notNull().unique(),
    locale: text("locale").notNull(),
    market: text("market").notNull(),
    status: keywordStatus("status").notNull(),
    firstSeenImportBatchId: uuid("first_seen_import_batch_id")
        .notNull()
        .references(() => importBatches.id),
    ...timestamps,
}, (table) => [
    index("keyword_niche_status_idx").on(table.nicheId, table.status),
]);
export const keywordAliases = pgTable("keyword_alias", {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id")
        .notNull()
        .references(() => keywords.id),
    alias: text("alias").notNull(),
    canonicalHash: text("canonical_hash").notNull(),
    ...timestamps,
}, (table) => [
    uniqueIndex("keyword_alias_keyword_hash_uq").on(table.keywordId, table.canonicalHash),
]);
export const importRows = pgTable("import_row", {
    id: uuid("id").primaryKey(),
    batchId: uuid("batch_id")
        .notNull()
        .references(() => importBatches.id),
    rowNumber: integer("row_number").notNull(),
    rawJson: jsonb("raw_json").notNull(),
    rowHash: text("row_hash").notNull(),
    status: importRowStatus("status").notNull(),
    rejectReason: text("reject_reason"),
    keywordId: uuid("keyword_id").references(() => keywords.id),
    ...timestamps,
}, (table) => [
    uniqueIndex("import_row_batch_number_uq").on(table.batchId, table.rowNumber),
]);
export const keywordMetrics = pgTable("keyword_metric", {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id")
        .notNull()
        .references(() => keywords.id),
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
    ...timestamps,
}, (table) => [
    uniqueIndex("keyword_metric_current_uq")
        .on(table.keywordId, table.metricName, table.sourceName)
        .where(sql `${table.supersededAt} is null`),
    check("keyword_metric_numeric_present", sql `${table.numericValue} is null or ${table.valueStatus} = 'PRESENT'`),
]);
export const facets = pgTable("facet", {
    id: uuid("id").primaryKey(),
    kind: facetKind("kind").notNull(),
    slug: text("slug").notNull().unique(),
    label: text("label").notNull(),
    synonyms: text("synonyms").array().notNull().default(sql `'{}'::text[]`),
    ...timestamps,
});
export const keywordFacets = pgTable("keyword_facet", {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id")
        .notNull()
        .references(() => keywords.id),
    facetId: uuid("facet_id")
        .notNull()
        .references(() => facets.id),
    role: text("role").notNull(),
    agentRunId: uuid("agent_run_id").references(() => agentRuns.id),
    ...timestamps,
}, (table) => [
    uniqueIndex("keyword_facet_pair_uq").on(table.keywordId, table.facetId),
]);
export const keywordClusters = pgTable("keyword_cluster", {
    id: uuid("id").primaryKey(),
    nicheId: uuid("niche_id")
        .notNull()
        .references(() => niches.id),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    method: text("method").notNull(),
    methodVersion: text("method_version").notNull(),
    ...timestamps,
}, (table) => [
    uniqueIndex("keyword_cluster_niche_slug_uq").on(table.nicheId, table.slug),
]);
export const keywordClusterMembers = pgTable("keyword_cluster_member", {
    id: uuid("id").primaryKey(),
    clusterId: uuid("cluster_id")
        .notNull()
        .references(() => keywordClusters.id),
    keywordId: uuid("keyword_id")
        .notNull()
        .references(() => keywords.id),
    isPrimary: boolean("is_primary").notNull().default(false),
    ...timestamps,
}, (table) => [
    uniqueIndex("keyword_cluster_member_pair_uq").on(table.clusterId, table.keywordId),
]);
export const keywordAnalyses = pgTable("keyword_analysis", {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id")
        .notNull()
        .references(() => keywords.id),
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
    agentRunId: uuid("agent_run_id")
        .notNull()
        .references(() => agentRuns.id),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    ...timestamps,
}, (table) => [
    uniqueIndex("keyword_analysis_current_uq")
        .on(table.keywordId)
        .where(sql `${table.supersededAt} is null`),
]);
export const keywordScores = pgTable("keyword_score", {
    id: uuid("id").primaryKey(),
    keywordId: uuid("keyword_id")
        .notNull()
        .references(() => keywords.id),
    scoreKind: text("score_kind").notNull(),
    modelId: text("model_id").notNull(),
    modelVersion: text("model_version").notNull(),
    score: numeric("score", { precision: 6, scale: 3 }),
    band: scoreBand("band").notNull(),
    dataCompleteness: numeric("data_completeness", {
        precision: 4,
        scale: 3,
    }).notNull(),
    components: jsonb("components").notNull(),
    missingInputs: text("missing_inputs").array().notNull(),
    agentRunId: uuid("agent_run_id").references(() => agentRuns.id),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    ...timestamps,
}, (table) => [
    uniqueIndex("keyword_score_current_uq")
        .on(table.keywordId, table.scoreKind, table.modelId)
        .where(sql `${table.supersededAt} is null`),
    check("keyword_score_null_iff_insufficient", sql `(${table.score} is null) = (${table.band} = 'INSUFFICIENT_DATA')`),
    check("keyword_score_missing_iff_complete", sql `(cardinality(${table.missingInputs}) = 0) = (${table.dataCompleteness} = 1)`),
]);
export const costEvents = pgTable("cost_event", {
    id: uuid("id").primaryKey(),
    agentRunId: uuid("agent_run_id")
        .notNull()
        .references(() => agentRuns.id),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    estimatedCostUsd: numeric("estimated_cost_usd", {
        precision: 12,
        scale: 6,
    }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestamps,
}, (table) => [
    check("cost_event_cost_nonnegative", sql `${table.estimatedCostUsd} >= 0`),
]);
//# sourceMappingURL=schema.js.map