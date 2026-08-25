# SECURITY MODEL

Status: **M2 planning — awaiting approval**
Date: 2026-08-25
Related: [ARCHITECTURE.md](./ARCHITECTURE.md) · [COST_CONTROL.md](./COST_CONTROL.md) · [ADR-0012](./ADR/ADR-0012-secrets-env-not-committed.md)

Covers: security model (6) for M2 (local CLI) and the seams for later networked milestones.

---

## 1. Threat model (M2)

M2 is a **single-operator local CLI**. There is no public HTTP server, no multi-user auth, and no WordPress credentials in use.

| Threat | Likelihood (M2) | Impact | Mitigation |
|--------|-----------------|--------|------------|
| Secrets committed to git | Medium | High (key leak) | `.gitignore`, pre-commit secret scan, `.env.example` only, CI `git grep` for key patterns |
| Secrets in logs / reports | Medium | High | pino redaction paths; reports never print env; token fields stripped |
| Prompt injection via CSV/SERP text | Low now / High later | Medium (wrong analysis) | Untrusted text delimited; JSON schema; no tool-calling agents in M2 |
| Fabricated claims reaching later publish | High if unguarded | High (FTC / Associates / brand) | Guardrails + provenance; publish still human-gated in M7 |
| OneDrive / shared-folder leak | Medium | Medium | Relocate repo (DN-01); never put `.env` in synced public shares |
| Supply-chain (npm) | Medium | High | `package-lock.json` committed; `npm ci`; no postinstall scripts from unknown pkgs; pin versions |
| Path traversal in import `--file` | Low | Medium | Resolve path, must stay inside workspace or explicit allowlist |
| Budget DoS (runaway LLM) | Medium if key present | Medium $ | Daily cap, per-run cap, `ALLOW_EXPENSIVE` flag, Mock default |

Out of M2: CSRF, session theft, WP takeover, PA-API replay — those join the threat model at M4/M7.

## 2. Secrets

- **Never commit API keys.** `.env` gitignored. `.env.example` lists names only.
- Config loads via Zod; boot **fails closed** if a required secret is empty **only when that provider is selected**. Default provider `mock` needs no secrets.
- Future `SecretSource` interface: `EnvSecretSource` now; vault adapter later.
- Rotation: human runbook — revoke key at vendor, replace `.env`, no code change.

## 3. Logging and PII

- Structured JSON logs. Redact: `authorization`, `apiKey`, `key`, `token`, `password`, `cookie`.
- CSV keywords are not sensitive PII; still do not log full `.env`.
- `audit_event` stores state diffs, not secrets.

## 4. Trust boundaries

```
[operator CLI] → [config/.env] → [process]
[CSV file] → parser (untrusted strings) → DB
[LLM provider] → JSON parse + guardrails → DB
[future HTTP] → authn/authz (not built)
```

LLM output is **untrusted** until Zod + guardrails pass. Deterministic extractors are trusted for control flow but still persist provenance.

## 5. Affiliate and legal (design, not legal advice)

Compliance **rules are data** (`MASTER_SPEC.md` §17), not hardcoded statutes. M2 ships the **banned-experience-phrase** list and the “no fabricated numbers” engine. FTC disclosure, Associates Operating Agreement, and trademark rules are loaded as versioned rule files in M6. This document does not interpret those policies.

## 6. Later milestones (seams)

| Milestone | Add |
|-----------|-----|
| M3 | Provider API keys, rate limits, store raw SERP under access control |
| M4 | PA-API credentials, no scraping Amazon HTML as a hidden source |
| M6 | Reviewer identity on `human_review` |
| M7 | WordPress application password in secrets; draft-only default; webhook signatures |
| M7+ | If `apps/api` exists: TLS, auth, CSRF, RBAC |

## 7. M2 acceptance (security)

- `npm test` includes a test that a fake OpenAI key in a fixture log is redacted.
- `gitleaks` or equivalent pattern check in CI (M2-007).
- Import of a path outside allowlist fails.
- Default pipeline with no keys completes at `$0.00` recorded cost.
