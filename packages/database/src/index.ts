import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema.js";

export * from "./repositories.js";
export * from "./schema.js";
export * from "./seed.js";

export function createDatabase(client: PGlite) {
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDatabase>;

export async function migrate(client: PGlite): Promise<void> {
  const migrationUrl = new URL("../drizzle/0000_lean_m2.sql", import.meta.url);
  const migration = await readFile(migrationUrl, "utf8").catch((error: unknown) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return readFile(
        join(process.cwd(), "packages", "database", "drizzle", "0000_lean_m2.sql"),
        "utf8",
      );
    }
    throw error;
  });
  await client.exec(migration);
}

export async function createTestDb(): Promise<{
  client: PGlite;
  db: Database;
  close: () => Promise<void>;
}> {
  const client = new PGlite();
  await client.waitReady;
  await migrate(client);
  return {
    client,
    db: createDatabase(client),
    close: async () => client.close(),
  };
}
