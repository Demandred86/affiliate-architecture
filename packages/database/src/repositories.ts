import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import type { Database } from "./index.js";
import { importBatches, keywords, niches } from "./schema.js";

export function canonicalizeKeyword(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

export function keywordCanonicalHash(
  canonicalText: string,
  market: string,
  locale: string,
): string {
  return createHash("sha256")
    .update(`${canonicalText}\u0000${market}\u0000${locale}`)
    .digest("hex");
}

export class NicheRepository {
  public constructor(private readonly db: Database) {}

  async findBySlug(slug: string) {
    const [niche] = await this.db
      .select()
      .from(niches)
      .where(eq(niches.slug, slug))
      .limit(1);
    return niche;
  }

  async insert(input: typeof niches.$inferInsert) {
    const [niche] = await this.db.insert(niches).values(input).returning();
    return niche;
  }
}

export class ImportBatchRepository {
  public constructor(private readonly db: Database) {}

  async insert(
    input: Omit<typeof importBatches.$inferInsert, "id"> & { id?: string },
  ) {
    const [batch] = await this.db
      .insert(importBatches)
      .values({ ...input, id: input.id ?? uuidv7() })
      .returning();
    return batch;
  }
}

export interface InsertCanonicalKeyword {
  nicheId: string;
  firstSeenImportBatchId: string;
  rawText: string;
  market?: string;
  locale?: string;
  status?: "IMPORTED" | "ANALYZED" | "SCORED" | "PARKED" | "REJECTED";
}

export class KeywordRepository {
  public constructor(private readonly db: Database) {}

  async insertCanonical(input: InsertCanonicalKeyword) {
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

    if (inserted) return inserted;

    const [existing] = await this.db
      .select()
      .from(keywords)
      .where(eq(keywords.canonicalHash, canonicalHash))
      .limit(1);
    if (!existing) throw new Error("Keyword conflict did not return a row");
    return existing;
  }

  async count(): Promise<number> {
    const rows = await this.db.select({ id: keywords.id }).from(keywords);
    return rows.length;
  }
}
