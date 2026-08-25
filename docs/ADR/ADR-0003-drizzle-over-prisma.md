# ADR-0003: Drizzle over Prisma

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Spec allows Prisma or Drizzle. Prisma Migrate wants a shadow database. Docker and Postgres are not installed, so `prisma migrate dev` cannot run here. Prisma also ships a query engine binary.

## Decision

**Drizzle ORM + drizzle-kit** SQL migrations. Same schema against PGlite (`postgres` dialect) and `node-postgres`.

## Consequences

- Migrations are reviewable SQL.
- `drizzle-zod` keeps DB and contracts aligned via tests.
- If the team later prefers Prisma, that is a new ADR; it is not required for M2.
