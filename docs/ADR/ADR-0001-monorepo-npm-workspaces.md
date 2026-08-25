# ADR-0001: Monorepo with npm workspaces

Date: 2026-08-25
Status: Accepted (pending M2 approval)

## Context

The spec suggests `/apps`, `/agents`, `/packages`. Tooling options: pnpm, npm workspaces, Nx, Turborepo. This machine has npm 10.9; pnpm is not installed. The repo sits in OneDrive, which handles pnpm's symlink-heavy `node_modules` poorly.

## Decision

Use **npm workspaces** with a single lockfile. No Nx/Turborepo until CI time justifies it.

## Consequences

- Zero extra global installs.
- Hoisting is less strict than pnpm; enforce layer lint rules instead.
- Revisit pnpm only after relocating off OneDrive (DN-01) and if duplication becomes painful.
