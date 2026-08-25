# RISKS AND MITIGATIONS

Status: **M2 planning — awaiting approval**
Date: 2026-08-25
Related: [ASSUMPTIONS.md](./ASSUMPTIONS.md) · [SECURITY.md](./SECURITY.md) · [COST_CONTROL.md](./COST_CONTROL.md)

Covers: risks and mitigations (14).

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | OneDrive corrupts `node_modules` or PGlite files | High | High | Relocate repo (DN-01); gitignore `data/`; document exception if staying |
| R2 | PGlite diverges from Postgres | Medium | Medium | Avoid exotic SQL; M2-042 parity when a server exists; no `pgvector` in M2 |
| R3 | Scope creep into M3–M7 | High | High | Stop condition; DESIGN-ONLY tables; this planning gate |
| R4 | Treating M1 scores as ground truth | High | High | Hypothesis metrics; v1 ignores them; report labels |
| R5 | LLM spend or runaway loops | Medium | Medium | Mock default; budgets; one repair only; deterministic first |
| R6 | Fabricated testing language in later writers | High later | High | Guardrails shipped in M2; fixtures |
| R7 | No git remote — total loss | High today | High | H-003 private remote |
| R8 | CSV parser too naive | Medium | Medium | Spec parser + quoted-comma fixture (KD-10) |
| R9 | Niche label mismatch drops 10 keywords | Medium | High | `niche_alias` (KD-03) |
| R10 | `TOP50` filename vs 44 rows | Low | Low | Count from file (KD-01) |
| R11 | Medical/elderly wording (kneeler) | Medium | High later | Slot as USER; prohibited-claims in M5/M6; M2 must not emit health claims |
| R12 | Amazon PA-API never approved | Medium | High for M4 | ProductDataSource abstraction; not M2 blocker |
| R13 | No SERP budget/vendor | Medium | High for M3 | Provider-agnostic tables; not M2 |
| R14 | PowerShell quoting / CRLF | Medium | Medium | Node scripts; `.gitattributes` LF |
| R15 | Estimates wrong | Medium | Low | P0 slice still yields acceptance pipeline |
| R16 | Secret leak via logs/reports | Medium | High | Redaction tests; never print env |
| R17 | Idempotency bugs duplicate keywords | Medium | Medium | canonical_hash unique; pipeline test M2-135 |
| R18 | Legal/compliance assumed in code | Medium | High | Rules as data from M6; M2 only safety detectors |

No risk is “accept without mitigation” for R1, R3, R4, R7.
