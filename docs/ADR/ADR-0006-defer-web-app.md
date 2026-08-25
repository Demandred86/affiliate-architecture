# ADR-0006: Defer the web application

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Spec §7 recommends Next.js. Spec §31 M2 list is CLI pipeline: import → analyse → score → report. Human review UI is needed at M6.

## Decision

**No `apps/web` implementation in M2.** Directory reserved with README. First UI: M6 review queue.

## Consequences

- Faster M2; Playwright unused until then.
- Operators use CLI + Markdown/CSV reports.
