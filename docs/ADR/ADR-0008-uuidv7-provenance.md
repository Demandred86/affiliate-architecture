# ADR-0008: UUID v7 and provenance mixin

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Spec requires id, timestamps, source, confidence, evidence, status, version, provenance. Client-side id generation is needed before insert during batch import.

## Decision

**UUID v7** PKs. Shared Drizzle mixin `withProvenance`. `source_type` distinguishes HYPOTHESIS vs MEASURED.

## Consequences

- Time-ordered ids for logs.
- M1 scores cannot silently become “facts”.
