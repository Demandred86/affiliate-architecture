#!/usr/bin/env node

import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { budgetCapsFromConfig } from "@ase/agent-core";
import { loadConfig } from "@ase/config";
import { createDatabase, migrate, seed } from "@ase/database";
import { importM1Csv } from "@ase/importer";
import { analyzeNicheKeywords } from "@ase/keyword-agent";
import { DEFAULT_NICHE, runPipeline } from "@ase/pipeline";
import { scoreNicheKeywords } from "@ase/scoring";
import { PGlite } from "@electric-sql/pglite";

const usage = `Automated SEO Engine (ase)

Usage:
  ase --help
  ase db migrate
  ase db seed
  ase import --file <csv>
  ase analyze [--niche <slug>]
  ase score [--niche <slug>]
  ase pipeline --file <csv> [--niche <slug>] [--out <directory>]
  ase pipeline import-and-score <csv> [--out <directory>]

The default PGlite database is stored in the OS local application-data directory.
Set DATABASE_PATH to override it.`;

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function requiredFile(args: string[]): string {
  const aliasIndex = args.indexOf("import-and-score");
  const value =
    option(args, "--file") ??
    (aliasIndex >= 0 ? args[aliasIndex + 1] : undefined) ??
    (args[0] && !args[0].startsWith("-") ? args[0] : undefined);
  if (!value) throw new Error("A CSV path is required (--file <csv>)");
  return resolve(value);
}

async function withDatabase<T>(
  callback: (client: PGlite) => Promise<T>,
): Promise<T> {
  const config = loadConfig();
  await mkdir(dirname(config.DATABASE_PATH), { recursive: true });
  const client = new PGlite(config.DATABASE_PATH);
  await client.waitReady;
  try {
    return await callback(client);
  } finally {
    await client.close();
  }
}

function print(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function main(): Promise<void> {
  const [command, subcommand, ...rest] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(`${usage}\n`);
    return;
  }
  const config = loadConfig();
  const caps = budgetCapsFromConfig(config);

  if (command === "db" && subcommand === "migrate") {
    await withDatabase(async (client) => migrate(client));
    print({ command: "db migrate", status: "ok", database_path: config.DATABASE_PATH });
    return;
  }
  if (command === "db" && subcommand === "seed") {
    await withDatabase(async (client) => seed(createDatabase(client)));
    print({ command: "db seed", status: "ok", database_path: config.DATABASE_PATH });
    return;
  }
  if (command === "import") {
    const args = [subcommand, ...rest].filter(
      (value): value is string => value !== undefined,
    );
    const filePath = requiredFile(args);
    const content = await readFile(filePath);
    const result = await withDatabase((client) =>
      importM1Csv(createDatabase(client), {
        content,
        sourcePath: filePath,
        actor: "cli",
      }),
    );
    print(result);
    if (result.status === "PARTIAL") process.exitCode = 1;
    return;
  }
  if (command === "analyze" || command === "score") {
    const args = [subcommand, ...rest].filter(
      (value): value is string => value !== undefined,
    );
    const niche = option(args, "--niche") ?? DEFAULT_NICHE;
    if (command === "analyze") {
      const result = await withDatabase((client) =>
        analyzeNicheKeywords(createDatabase(client), niche, caps),
      );
      print({ command, niche, ...result });
    } else {
      const result = await withDatabase((client) =>
        scoreNicheKeywords(createDatabase(client), niche, caps),
      );
      print({ command, niche, ...result });
    }
    return;
  }
  if (command === "pipeline") {
    const args = [subcommand, ...rest].filter(
      (value): value is string => value !== undefined,
    );
    const filePath = requiredFile(args);
    const niche = option(args, "--niche") ?? DEFAULT_NICHE;
    const outputDirectory = resolve(option(args, "--out") ?? "reports/m2-latest");
    const content = await readFile(filePath);
    const result = await withDatabase((client) =>
      runPipeline(createDatabase(client), {
        content,
        sourcePath: filePath,
        niche,
        outputDirectory,
        budgetCaps: caps,
      }),
    );
    print({
      status: result.importResult.status,
      reused_import: result.importResult.reused,
      summary: result.report.summary,
      total_estimated_cost_usd: result.report.total_estimated_cost_usd,
      llm_calls: result.report.llm_calls,
      artifacts: result.artifacts,
    });
    if (result.importResult.status === "PARTIAL") process.exitCode = 1;
    return;
  }
  throw new Error("Unknown command. Run ase --help.");
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Unknown CLI failure"}\n`,
  );
  process.exitCode = 2;
});
