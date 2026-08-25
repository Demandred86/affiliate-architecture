# ADR-0007: Deterministic-first agents

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

§9 wants prompts and confidence; §23 forbids expensive models when a function suffices. M1 keywords almost all match `best X for Y`.

## Decision

Keyword agent: **grammar + lexicon first**. LLM only if confidence < 0.7 or pattern `OTHER`. Scoring is **never** an LLM. Mock provider is the default.

## Consequences

- $0 acceptance run.
- Tests do not need network.
- LLM path still fully instrumented for later use.
