# ADR-0004: PGlite locally, real Postgres for staging/prod

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

M2 must run offline with zero services (no Docker, no `psql`). SQLite would be simpler but diverges from `jsonb`, enums, and partial unique indexes that the spec needs. Hosted Neon/Supabase needs network and an account.

## Decision

- **Dev/test:** [PGlite](https://pglite.dev/) (Postgres compiled to WASM/embedded).
- **Staging/prod:** PostgreSQL 16+ (hosted or Docker when available).
- **Parity job (M2-042):** optional `DATABASE_URL` runs the same migrations.

## Consequences

- Acceptance demo works on this laptop.
- Risk: PGlite ≠ full Postgres. Mitigate with parity job and avoiding exotic extensions (`pgvector` only when real PG exists).
- Data files must not live in OneDrive (DN-01 / DATABASE.md §10).
