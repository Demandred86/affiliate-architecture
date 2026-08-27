import type { Database } from "./index.js";
import { importBatches, niches } from "./schema.js";
export declare function canonicalizeKeyword(value: string): string;
export declare function keywordCanonicalHash(canonicalText: string, market: string, locale: string): string;
export declare class NicheRepository {
    private readonly db;
    constructor(db: Database);
    findBySlug(slug: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: string;
        slug: string;
        name: string;
        status: "ACTIVE" | "PARKED";
        market: string;
        language: string;
    } | undefined>;
    insert(input: typeof niches.$inferInsert): Promise<{
        createdAt: Date;
        id: string;
        language: string;
        market: string;
        name: string;
        slug: string;
        status: "ACTIVE" | "PARKED";
        updatedAt: Date;
    } | undefined>;
}
export declare class ImportBatchRepository {
    private readonly db;
    constructor(db: Database);
    insert(input: Omit<typeof importBatches.$inferInsert, "id"> & {
        id?: string;
    }): Promise<{
        acceptedCount: number;
        actor: string;
        createdAt: Date;
        fileSha256: string;
        id: string;
        importerVersion: string;
        rejectedCount: number;
        rowCount: number;
        sourcePath: string;
        status: "COMPLETE" | "FAILED" | "PARTIAL" | "PENDING";
        updatedAt: Date;
    } | undefined>;
}
export interface InsertCanonicalKeyword {
    nicheId: string;
    firstSeenImportBatchId: string;
    rawText: string;
    market?: string;
    locale?: string;
    status?: "IMPORTED" | "ANALYZED" | "SCORED" | "PARKED" | "REJECTED";
}
export declare class KeywordRepository {
    private readonly db;
    constructor(db: Database);
    insertCanonical(input: InsertCanonicalKeyword): Promise<{
        canonicalHash: string;
        canonicalText: string;
        createdAt: Date;
        firstSeenImportBatchId: string;
        id: string;
        locale: string;
        market: string;
        nicheId: string;
        rawText: string;
        status: "ANALYZED" | "IMPORTED" | "PARKED" | "REJECTED" | "SCORED";
        updatedAt: Date;
    }>;
    count(): Promise<number>;
}
//# sourceMappingURL=repositories.d.ts.map