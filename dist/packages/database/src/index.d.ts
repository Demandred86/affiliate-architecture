import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema.js";
export * from "./repositories.js";
export * from "./schema.js";
export * from "./seed.js";
export declare function createDatabase(client: PGlite): import("drizzle-orm/pglite").PgliteDatabase<typeof schema> & {
    $client: PGlite;
};
export type Database = ReturnType<typeof createDatabase>;
export declare function migrate(client: PGlite): Promise<void>;
export declare function createTestDb(): Promise<{
    client: PGlite;
    db: Database;
    close: () => Promise<void>;
}>;
//# sourceMappingURL=index.d.ts.map