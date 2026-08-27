import { type Database } from "@ase/database";
export declare const IMPORTER_VERSION = "m1-csv-v1";
export declare const M1_COLUMNS: readonly ["rank", "niche", "keyword", "opportunity_score", "serp_opportunity", "reason", "research_priority"];
export interface ImportM1CsvInput {
    content: string | Buffer;
    sourcePath: string;
    actor?: string;
}
export interface ImportM1CsvResult {
    batchId: string;
    fileSha256: string;
    rowCount: number;
    acceptedCount: number;
    rejectedCount: number;
    duplicateCount: number;
    status: "COMPLETE" | "PARTIAL" | "FAILED";
    reused: boolean;
}
export declare function importM1Csv(db: Database, input: ImportM1CsvInput): Promise<ImportM1CsvResult>;
//# sourceMappingURL=index.d.ts.map