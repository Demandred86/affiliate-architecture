# ADR-0002: TypeScript on Node 22

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Spec recommends TypeScript + Node. Node v22.18.0 is installed. Python is not. A future Next.js UI should share Zod types with the CLI.

## Decision

**TypeScript 5.x, ESM, `strict`, Node 22 LTS** (`engines` field). No Python in the toolchain.

## Consequences

- Native `fetch`, `--env-file`, good test runners.
- Windows/PowerShell: all scripts are Node, not bash.
