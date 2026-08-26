#!/usr/bin/env node

const usage = `Automated SEO Engine (ase)

Usage:
  ase --help

Database and pipeline commands are added by later approved M2 tasks.`;

if (process.argv.includes("--help") || process.argv.length === 2) {
  process.stdout.write(`${usage}\n`);
} else {
  process.stderr.write(`Unknown command. Run ase --help.\n`);
  process.exitCode = 1;
}
