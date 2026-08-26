import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { budgetCapsFromConfig, type BudgetCaps } from "@ase/agent-core";
import {
  agentRuns,
  costEvents,
  keywordAnalyses,
  keywordClusterMembers,
  keywordMetrics,
  keywordScores,
  keywords,
  niches,
  type Database,
} from "@ase/database";
import { importM1Csv, type ImportM1CsvResult } from "@ase/importer";
import { analyzeNicheKeywords } from "@ase/keyword-agent";
import { scoreNicheKeywords } from "@ase/scoring";
import { and, eq, inArray } from "drizzle-orm";
import { stringify } from "csv-stringify/sync";

export const REPORT_SCHEMA_VERSION = "1.0.0";
export const DEFAULT_NICHE = "problem-solving-gardening";

export interface PipelineSummary {
  imported: number;
  rejected: number;
  duplicates: number;
  analyzed: number;
  clustered: number;
  scored: number;
  errors: string[];
}

export interface KeywordReportRow {
  keyword: string;
  analysis: {
    pattern_type: string;
    intent_type: string;
    path: "DETERMINISTIC";
  };
  provisional_opportunity_score: {
    score_kind: "OPPORTUNITY_SCORE";
    label: "PROVISIONAL_OPPORTUNITY_SCORE";
    model_id: "opportunity-v1";
    score: number;
    band: string;
    missing_inputs: string[];
  };
  m1_hypothesis: {
    metric_name: "M1_HYPOTHESIS_SCORE";
    source_type: "HYPOTHESIS";
    score: number;
    serp_label: string | null;
  };
}

export interface PipelineReport {
  schema_version: string;
  generated_at: string;
  niche: string;
  summary: PipelineSummary;
  keywords: KeywordReportRow[];
  total_estimated_cost_usd: number;
  llm_calls: number;
}

export interface PipelineArtifacts {
  jsonPath: string;
  csvPath: string;
  markdownPath: string;
}

export interface RunPipelineInput {
  content: string | Buffer;
  sourcePath: string;
  niche?: string;
  outputDirectory?: string;
  budgetCaps: BudgetCaps;
}

export interface RunPipelineResult {
  importResult: ImportM1CsvResult;
  report: PipelineReport;
  artifacts: PipelineArtifacts | null;
}

export function defaultBudgetCaps(): BudgetCaps {
  return budgetCapsFromConfig({
    MAX_COST_PER_RUN_USD: 0.05,
    DAILY_BUDGET_USD: 1,
    MAX_PROJECT_BUDGET_USD: 5,
  });
}

async function buildReport(
  db: Database,
  nicheSlug: string,
  summary: PipelineSummary,
): Promise<PipelineReport> {
  const nicheKeywords = await db
    .select({ keyword: keywords })
    .from(keywords)
    .innerJoin(niches, eq(keywords.nicheId, niches.id))
    .where(eq(niches.slug, nicheSlug));
  const keywordIds = nicheKeywords.map(({ keyword }) => keyword.id);

  const analyses =
    keywordIds.length === 0
      ? []
      : await db
          .select()
          .from(keywordAnalyses)
          .where(inArray(keywordAnalyses.keywordId, keywordIds));
  const scores =
    keywordIds.length === 0
      ? []
      : await db
          .select()
          .from(keywordScores)
          .where(
            and(
              inArray(keywordScores.keywordId, keywordIds),
              eq(keywordScores.scoreKind, "OPPORTUNITY_SCORE"),
            ),
          );
  const metrics =
    keywordIds.length === 0
      ? []
      : await db
          .select()
          .from(keywordMetrics)
          .where(inArray(keywordMetrics.keywordId, keywordIds));

  const rows = nicheKeywords
    .map(({ keyword }) => {
      const analysis = analyses.find((item) => item.keywordId === keyword.id);
      const score = scores.find((item) => item.keywordId === keyword.id);
      const hypothesis = metrics.find(
        (item) =>
          item.keywordId === keyword.id &&
          item.metricName === "M1_HYPOTHESIS_SCORE",
      );
      const serpLabel = metrics.find(
        (item) =>
          item.keywordId === keyword.id &&
          item.metricName === "M1_HYPOTHESIS_SERP_LABEL",
      );
      if (!analysis || !score || score.score === null || !hypothesis?.numericValue) {
        return null;
      }
      if (hypothesis.sourceType !== "HYPOTHESIS") {
        throw new Error(
          `M1_HYPOTHESIS_SCORE has invalid source_type ${hypothesis.sourceType}`,
        );
      }
      return {
        keyword: keyword.canonicalText,
        analysis: {
          pattern_type: analysis.patternType,
          intent_type: analysis.intentType,
          path: "DETERMINISTIC" as const,
        },
        provisional_opportunity_score: {
          score_kind: "OPPORTUNITY_SCORE" as const,
          label: "PROVISIONAL_OPPORTUNITY_SCORE" as const,
          model_id: "opportunity-v1" as const,
          score: Number(score.score),
          band: score.band,
          missing_inputs: score.missingInputs,
        },
        m1_hypothesis: {
          metric_name: "M1_HYPOTHESIS_SCORE" as const,
          source_type: "HYPOTHESIS" as const,
          score: Number(hypothesis.numericValue),
          serp_label: serpLabel?.textValue ?? null,
        },
      } satisfies KeywordReportRow;
    })
    .filter((row) => row !== null)
    .sort((a, b) => a.keyword.localeCompare(b.keyword));

  const costs = await db.select().from(costEvents);
  const runs = await db.select().from(agentRuns);
  return {
    schema_version: REPORT_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    niche: nicheSlug,
    summary,
    keywords: rows,
    total_estimated_cost_usd: costs.reduce(
      (total, event) => total + Number(event.estimatedCostUsd),
      0,
    ),
    llm_calls: runs.filter((run) => run.model !== "deterministic").length,
  };
}

export function reportToCsv(report: PipelineReport): string {
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
      analysis_path: row.analysis.path,
    })),
    { header: true },
  );
}

export function reportToMarkdown(report: PipelineReport): string {
  const summary = report.summary;
  const keywordRows = report.keywords
    .map(
      (row) =>
        `| ${row.keyword} | ${row.provisional_opportunity_score.score.toFixed(3)} (${row.provisional_opportunity_score.band}) | ${row.m1_hypothesis.score.toFixed(3)} (HYPOTHESIS) |`,
    )
    .join("\n");
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

export async function writeReportArtifacts(
  report: PipelineReport,
  outputDirectory: string,
): Promise<PipelineArtifacts> {
  await mkdir(outputDirectory, { recursive: true });
  const artifacts = {
    jsonPath: join(outputDirectory, "m2-keyword-report.json"),
    csvPath: join(outputDirectory, "m2-keyword-report.csv"),
    markdownPath: join(outputDirectory, "m2-keyword-report.md"),
  };
  await Promise.all([
    writeFile(artifacts.jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8"),
    writeFile(artifacts.csvPath, reportToCsv(report), "utf8"),
    writeFile(artifacts.markdownPath, reportToMarkdown(report), "utf8"),
  ]);
  return artifacts;
}

export async function runPipeline(
  db: Database,
  input: RunPipelineInput,
): Promise<RunPipelineResult> {
  const niche = input.niche ?? DEFAULT_NICHE;
  const importResult = await importM1Csv(db, {
    content: input.content,
    sourcePath: input.sourcePath,
    actor: "pipeline",
  });
  if (importResult.status === "FAILED") {
    throw new Error("Import failed");
  }
  const analysis = await analyzeNicheKeywords(db, niche, input.budgetCaps);
  const scoring = await scoreNicheKeywords(db, niche, input.budgetCaps);
  const nicheKeywordIds = (
    await db
      .select({ id: keywords.id })
      .from(keywords)
      .innerJoin(niches, eq(keywords.nicheId, niches.id))
      .where(eq(niches.slug, niche))
  ).map((row) => row.id);
  const memberships =
    nicheKeywordIds.length === 0
      ? []
      : await db
          .select({ keywordId: keywordClusterMembers.keywordId })
          .from(keywordClusterMembers)
          .where(inArray(keywordClusterMembers.keywordId, nicheKeywordIds));
  const report = await buildReport(db, niche, {
    imported: importResult.acceptedCount,
    rejected: importResult.rejectedCount,
    duplicates: importResult.duplicateCount,
    analyzed: analysis.analyzedCount,
    clustered: new Set(memberships.map((item) => item.keywordId)).size,
    scored: scoring.scoredCount,
    errors: [],
  });
  const artifacts = input.outputDirectory
    ? await writeReportArtifacts(report, input.outputDirectory)
    : null;
  return { importResult, report, artifacts };
}
