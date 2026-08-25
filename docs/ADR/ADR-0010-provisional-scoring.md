# ADR-0010: Provisional scoring without volume/SERP

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

§31 asks for basic opportunity scoring. CSV scores are hypotheses. No volume/KD/SERP APIs in M2.

## Decision

Ship **`opportunity-v1`** using only analysis features. Always set `missing_inputs`. Label bands `PROVISIONAL_*`. **Do not** blend M1 scores into the formula.

## Consequences

- Honest reports.
- M3 can raise `data_completeness` without rewriting keywords.
