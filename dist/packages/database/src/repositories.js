import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { importBatches, keywords, niches } from "./schema.js";
export function canonicalizeKeyword(value) {
    return value.normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}
export function keywordCanonicalHash(canonicalText, market, locale) {
    return createHash("sha256")
        .update(`${canonicalText}\u0000${market}\u0000${locale}`)
        .digest("hex");
}
export class NicheRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findBySlug(slug) {
        const [niche] = await this.db
            .select()
            .from(niches)
            .where(eq(niches.slug, slug))
            .limit(1);
        return niche;
    }
    async insert(input) {
        const [niche] = await this.db.insert(niches).values(input).returning();
        return niche;
    }
}
export class ImportBatchRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async insert(input) {
        const [batch] = await this.db
            .insert(importBatches)
            .values({ ...input, id: input.id ?? uuidv7() })
            .returning();
        return batch;
    }
}
export class KeywordRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async insertCanonical(input) {
        const market = input.market ?? "US";
        const locale = input.locale ?? "en-US";
        const canonicalText = canonicalizeKeyword(input.rawText);
        const canonicalHash = keywordCanonicalHash(canonicalText, market, locale);
        const [inserted] = await this.db
            .insert(keywords)
            .values({
            id: uuidv7(),
            nicheId: input.nicheId,
            rawText: input.rawText,
            canonicalText,
            canonicalHash,
            locale,
            market,
            status: input.status ?? "IMPORTED",
            firstSeenImportBatchId: input.firstSeenImportBatchId,
        })
            .onConflictDoNothing({ target: keywords.canonicalHash })
            .returning();
        if (inserted)
            return inserted;
        const [existing] = await this.db
            .select()
            .from(keywords)
            .where(eq(keywords.canonicalHash, canonicalHash))
            .limit(1);
        if (!existing)
            throw new Error("Keyword conflict did not return a row");
        return existing;
    }
    async count() {
        const rows = await this.db.select({ id: keywords.id }).from(keywords);
        return rows.length;
    }
}
//# sourceMappingURL=repositories.js.map