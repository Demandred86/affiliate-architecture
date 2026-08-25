# ADR-0012: Secrets in environment, never committed

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Spec: never commit API keys. Single operator, local CLI.

## Decision

`.env` gitignored; Zod-validated config; provider adapters disabled when keys missing; default mock. CI secret scan.

## Consequences

- M2 works without vendor accounts.
- Vault/SecretSource later without rewriting agents.
