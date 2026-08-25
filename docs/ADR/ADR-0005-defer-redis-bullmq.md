# ADR-0005: Defer Redis + BullMQ

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Spec recommends Redis + BullMQ. Redis is not available without Docker. M2 processes ~44 keywords sequentially; reproducibility is more valuable than parallelism.

## Decision

Introduce a **`JobQueue` interface** with an **in-process sequential runner** persisted in table `job`. Add BullMQ (or pg-boss if Redis remains unavailable) in M3+ when SERP fan-out needs concurrency.

## Consequences

- No Redis in M2 Docker-less setup.
- Orchestration code must not import BullMQ types.
