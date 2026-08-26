import { v7 as uuidv7 } from "uuid";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  createTestDb,
  ImportBatchRepository,
  KeywordRepository,
  keywords,
  NicheRepository,
  nicheAliases,
  niches,
  seed,
} from "./index.js";

const expectedTables = [
  "agent_prompt",
  "agent_run",
  "cost_event",
  "facet",
  "import_batch",
  "import_row",
  "keyword",
  "keyword_alias",
  "keyword_analysis",
  "keyword_cluster",
  "keyword_cluster_member",
  "keyword_facet",
  "keyword_metric",
  "keyword_score",
  "niche",
  "niche_alias",
].sort();

async function createKeywordFixture() {
  const testDb = await createTestDb();
  const niche = await new NicheRepository(testDb.db).insert({
    id: uuidv7(),
    slug: "fixture",
    name: "Fixture",
    status: "ACTIVE",
    market: "US",
    language: "en-US",
  });
  const batch = await new ImportBatchRepository(testDb.db).insert({
    sourcePath: "fixture.csv",
    fileSha256: "a".repeat(64),
    importerVersion: "1.0.0",
    rowCount: 1,
    acceptedCount: 0,
    rejectedCount: 0,
    status: "PENDING",
    actor: "test",
  });
  if (!niche || !batch) throw new Error("Fixture setup failed");
  return { ...testDb, niche, batch };
}

describe("lean M2 database", () => {
  it("migrates only the approved table set and seeds the niche alias", async () => {
    const testDb = await createTestDb();
    try {
      await seed(testDb.db);
      const result = await testDb.client.query<{ table_name: string }>(
        `select table_name
         from information_schema.tables
         where table_schema = 'public' and table_type = 'BASE TABLE'
         order by table_name`,
      );
      expect(result.rows.map((row) => row.table_name)).toEqual(expectedTables);

      const aliases = await testDb.db
        .select({ alias: nicheAliases.alias, slug: niches.slug })
        .from(nicheAliases)
        .innerJoin(niches, eq(nicheAliases.nicheId, niches.id));
      expect(aliases).toContainEqual({
        alias: "Lawn & Garden",
        slug: "problem-solving-gardening",
      });

      const seededNiches = await testDb.db
        .select({ slug: niches.slug, status: niches.status })
        .from(niches);
      expect(seededNiches).toHaveLength(5);
      expect(
        seededNiches.filter((niche) => niche.status === "ACTIVE"),
      ).toEqual([
        { slug: "problem-solving-gardening", status: "ACTIVE" },
      ]);
      expect(
        seededNiches.filter((niche) => niche.status === "PARKED"),
      ).toHaveLength(4);
    } finally {
      await testDb.close();
    }
  });

  it("creates isolated PGlite databases", async () => {
    const first = await createKeywordFixture();
    const second = await createKeywordFixture();
    try {
      await new KeywordRepository(first.db).insertCanonical({
        nicheId: first.niche.id,
        firstSeenImportBatchId: first.batch.id,
        rawText: "best pruning shears for small hands",
      });
      expect(await new KeywordRepository(first.db).count()).toBe(1);
      expect(await new KeywordRepository(second.db).count()).toBe(0);
    } finally {
      await first.close();
      await second.close();
    }
  });

  it("returns the same canonical keyword and enforces its unique hash", async () => {
    const testDb = await createKeywordFixture();
    try {
      const repository = new KeywordRepository(testDb.db);
      const first = await repository.insertCanonical({
        nicheId: testDb.niche.id,
        firstSeenImportBatchId: testDb.batch.id,
        rawText: " Best  Pruning Shears For Small Hands ",
      });
      const second = await repository.insertCanonical({
        nicheId: testDb.niche.id,
        firstSeenImportBatchId: testDb.batch.id,
        rawText: "best pruning shears for small hands",
      });
      expect(second.id).toBe(first.id);
      expect(await repository.count()).toBe(1);

      await expect(
        testDb.db.insert(keywords).values({
          ...first,
          id: uuidv7(),
          rawText: "duplicate",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).rejects.toThrow();
    } finally {
      await testDb.close();
    }
  });
});
