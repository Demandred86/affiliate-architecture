# ADR-0011: Structured logging with pino plus audit table

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

Spec requires structured JSON logs. State changes must be queryable for learning and compliance.

## Decision

**pino** to stdout (JSON). **`audit_event` table** for entity transitions. Logs are not the audit trail.

## Consequences

- Redaction plugins for secrets.
- OpenTelemetry deferred until a long-running worker exists.
