# ADR-0009: Zod as the shared contract

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Validation is needed at CSV edge, LLM JSON edge, and CLI args. Spec recommends Zod.

## Decision

**Zod schemas in `packages/schemas`** are canonical. LLM structured output uses JSON Schema derived from the same Zod. DB types are tested against Zod, not allowed to drift.

## Consequences

- One definition, three boundaries.
- Invalid model JSON never reaches tables.
