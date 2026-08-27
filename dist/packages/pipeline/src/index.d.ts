import { type BudgetCaps } from "@ase/agent-core";
import { type Database } from "@ase/database";
import { type ImportM1CsvResult } from "@ase/importer";
export declare const REPORT_SCHEMA_VERSION = "1.0.0";
export declare const DEFAULT_NICHE = "problem-solving-gardening";
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
export declare function defaultBudgetCaps(): BudgetCaps;
export declare function reportToCsv(report: PipelineReport): string;
export declare function reportToMarkdown(report: PipelineReport): string;
export declare function writeReportArtifacts(report: PipelineReport, outputDirectory: string): Promise<PipelineArtifacts>;
export declare function runPipeline(db: Database, input: RunPipelineInput): Promise<RunPipelineResult>;
//# sourceMappingURL=index.d.ts.map