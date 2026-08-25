# ADR-0014: Model routing and budget guards

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

§24 requires an `AIProvider` abstraction. §23 requires cost tracking, caching, cheap vs strong routing, human approval for expensive actions.

## Decision

Hand-rolled **AIProvider** (OpenAI, Anthropic, Mock). Per-agent model config. **Daily and per-run USD caps**. `ALLOW_EXPENSIVE=false` by default. No LangChain.

## Consequences

- Exact token accounting.
- Accidental GPT-class spend is a config error, not a default.
