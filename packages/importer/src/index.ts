import { createHash } from "node:crypto";
import {
  canonicalizeKeyword,
  importBatches,
  importRows,
  keywordCanonicalHash,
  keywordMetrics,
  KeywordRepository,
  keywords,
  nicheAliases,
  niches,
  type Database,
} from "@ase/database";
import { eq } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import { v7 as uuidv7 } from "uuid";

export const IMPORTER_VERSION = "m1-csv-v1";
export const M1_COLUMNS = [
  "rank",
  "niche",
  "keyword",
  "opportunity_score",
  "serp_opportunity",
  "reason",
  "research_priority",
] as const;

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

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function rawRecord(header: readonly string[], row: readonly string[]) {
  const result: Record<string, string> = {};
  header.forEach((column, index) => {
    result[column] = row[index] ?? "";
  });
  if (row.length > header.length) {
    result._extra = row.slice(header.length).join(",");
  }
  return result;
}

function validateHeader(header: readonly string[]): void {
  if (
    header.length !== M1_COLUMNS.length ||
    header.some((column, index) => column !== M1_COLUMNS[index])
  ) {
    throw new Error(`Unexpected CSV columns: ${header.join(",")}`);
  }
}

export async function importM1Csv(
  db: Database,
  input: ImportM1CsvInput,
): Promise<ImportM1CsvResult> {
  const bytes = Buffer.isBuffer(input.content)
    ? input.content
    : Buffer.from(input.content, "utf8");
  const fileSha256 = sha256(bytes);
  const [existingBatch] = await db
    .select()
    .from(importBatches)
    .where(eq(importBatches.fileSha256, fileSha256))
    .limit(1);
  if (existingBatch?.importerVersion === IMPORTER_VERSION) {
    const rows = await db
      .select({ status: importRows.status })
      .from(importRows)
      .where(eq(importRows.batchId, existingBatch.id));
    return {
      batchId: existingBatch.id,
      fileSha256,
      rowCount: existingBatch.rowCount,
      acceptedCount: existingBatch.acceptedCount,
      rejectedCount: existingBatch.rejectedCount,
      duplicateCount: rows.filter((row) => row.status === "DUPLICATE").length,
      status:
        existingBatch.status === "PENDING"
          ? "FAILED"
          : existingBatch.status,
      reused: true,
    };
  }

  let records: string[][];
  try {
    records = parse(bytes, {
      bom: true,
      relax_column_count: true,
      skip_empty_lines: true,
    }) as string[][];
  } catch (error) {
    const [batch] = await db
      .insert(importBatches)
      .values({
        id: uuidv7(),
        sourcePath: input.sourcePath,
        fileSha256,
        importerVersion: IMPORTER_VERSION,
        rowCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        status: "FAILED",
        actor: input.actor ?? "system",
      })
      .returning();
    if (!batch) throw error;
    return {
      batchId: batch.id,
      fileSha256,
      rowCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      duplicateCount: 0,
      status: "FAILED",
      reused: false,
    };
  }

  const header = records.shift() ?? [];
  validateHeader(header);
  const [batch] = await db
    .insert(importBatches)
    .values({
      id: uuidv7(),
      sourcePath: input.sourcePath,
      fileSha256,
      importerVersion: IMPORTER_VERSION,
      rowCount: records.length,
      acceptedCount: 0,
      rejectedCount: 0,
      status: "PENDING",
      actor: input.actor ?? "system",
    })
    .returning();
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

  for (const [index, row] of records.entries()) {
    const rowNumber = index + 2;
    const raw = rawRecord(header, row);
    const rowHash = sha256(JSON.stringify(row));
    const niche = nicheByName.get(raw.niche ?? "");
    const rawKeyword = raw.keyword ?? "";
    const score = Number(raw.opportunity_score);
    const rejectReason =
      row.length !== header.length
        ? `EXPECTED_${header.length}_COLUMNS_GOT_${row.length}`
        : !niche
          ? "UNKNOWN_NICHE"
          : !rawKeyword.trim()
            ? "MISSING_KEYWORD"
            : !Number.isFinite(score) || score < 0 || score > 100
              ? "INVALID_OPPORTUNITY_SCORE"
              : !(raw.serp_opportunity?.trim())
                ? "MISSING_SERP_LABEL"
                : null;

    if (rejectReason || !niche) {
      rejectedCount += 1;
      await db.insert(importRows).values({
        id: uuidv7(),
        batchId: batch.id,
        rowNumber,
        rawJson: raw,
        rowHash,
        status: "REJECTED",
        rejectReason: rejectReason ?? "UNKNOWN_NICHE",
      });
      continue;
    }

    const canonicalText = canonicalizeKeyword(rawKeyword);
    const canonicalHash = keywordCanonicalHash(
      canonicalText,
      niche.market,
      niche.language,
    );
    const [before] = await db
      .select({ id: keywords.id })
      .from(keywords)
      .where(eq(keywords.canonicalHash, canonicalHash))
      .limit(1);
    const keyword = await keywordRepository.insertCanonical({
      nicheId: niche.id,
      firstSeenImportBatchId: batch.id,
      rawText: rawKeyword,
      market: niche.market,
      locale: niche.language,
    });
    const rowStatus = before ? "DUPLICATE" : "ACCEPTED";
    if (before) duplicateCount += 1;
    else acceptedCount += 1;

    await db.insert(importRows).values({
      id: uuidv7(),
      batchId: batch.id,
      rowNumber,
      rawJson: raw,
      rowHash,
      status: rowStatus,
      rejectReason: null,
      keywordId: keyword.id,
    });
    await db
      .insert(keywordMetrics)
      .values([
        {
          id: uuidv7(),
          keywordId: keyword.id,
          metricName: "M1_HYPOTHESIS_SCORE",
          numericValue: score.toFixed(3),
          textValue: null,
          sourceType: "HYPOTHESIS",
          sourceName: "m1-csv",
          sourceRef: `${batch.id}:${rowNumber}`,
          confidence: null,
          valueStatus: "PRESENT",
        },
        {
          id: uuidv7(),
          keywordId: keyword.id,
          metricName: "M1_HYPOTHESIS_SERP_LABEL",
          numericValue: null,
          textValue: raw.serp_opportunity,
          sourceType: "HYPOTHESIS",
          sourceName: "m1-csv",
          sourceRef: `${batch.id}:${rowNumber}`,
          confidence: null,
          valueStatus: "PRESENT",
        },
      ])
      .onConflictDoNothing();
  }

  const status = rejectedCount > 0 ? "PARTIAL" : "COMPLETE";
  await db
    .update(importBatches)
    .set({ acceptedCount, rejectedCount, status, updatedAt: new Date() })
    .where(eq(importBatches.id, batch.id));

  return {
    batchId: batch.id,
    fileSha256,
    rowCount: records.length,
    acceptedCount,
    rejectedCount,
    duplicateCount,
    status,
    reused: false,
  };
}
