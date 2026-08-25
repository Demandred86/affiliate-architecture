# ADR-0013: Forward-only migrations

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Greenfield DB. Down-migrations are rarely safe once data exists. M2 should not create unused tables that freeze wrong guesses.

## Decision

Numbered **forward-only** SQL. M2 migrates only tables it writes. Future entities documented in DATABASE.md / DATABASE_FUTURE.md.

## Consequences

- Corrective migrations instead of rollback.
- Smaller M2 review surface.
