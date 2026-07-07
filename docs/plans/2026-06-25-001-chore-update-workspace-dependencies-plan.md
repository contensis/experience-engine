---
title: Update workspace dependencies with high-friction audit
type: chore
status: active
date: 2026-06-25
---

# chore: Update workspace dependencies with high-friction audit

## Summary

Bump every mutable npm dependency across all 6 `package.json` files to the latest compatible version within existing caret (`^`) ranges, then audit available major-version upgrades and flag high-friction updates. The `@contensis/experience-engine` core package has zero runtime dependencies — this invariant is preserved. The core and React bindings packages have no updatable deps and pass through trivially. No behavioral code changes.

---

## Problem Frame

The workspace has not had a coordinated dependency update since its migration from `@contensis/personalization`. The root and three apps use caret ranges, so `npm update` would resolve to latest minors and patches, but the current lockfile may be stale. The two publishable packages (core and React bindings) have no updatable mutable dependencies. There is no automated dependency management (Dependabot, Renovate, `.ncurc`), and the only test suite is Cypress E2E (zero unit tests), making unverified major-version bumps risky. A structured two-phase approach — compatible first, then major audit — reduces risk while keeping dependencies current.

---

## Requirements

- R1. All dependencies in all workspace `package.json` files are updated to the latest compatible version within their existing semver range
- R2. The `@contensis/experience-engine` core package maintains zero runtime dependencies
- R3. High-friction major-version upgrades are identified and documented with risk rationale
- R4. The workspace builds and the existing Cypress E2E tests pass after updates
- R5. The internal dependency version between React bindings and core engine remains consistent

---

## Scope Boundaries

- Existing semver ranges are preserved (no range widening or tightening)
- Only version numbers in `package.json` files are changed; no lockfile-only dependencies are modified
- The `@contensis/experience-engine` package has no dependencies to update
- No dependencies are added or removed
- No behavioral code, configuration, or CI changes are included
- TailwindCSS v4 migration is explicitly **not** in scope (see Deferred to Follow-Up Work)
- ESLint config, TypeScript config, and build tool config are not migrated — only version numbers change

### Deferred to Follow-Up Work

- TailwindCSS v3 → v4 migration: full config rewrite, separate dedicated effort
- Remove unused `@microsoft/api-extractor` from root devDependencies: trivial cleanup, low value
- Consolidate duplicated ESLint deps in `apps/react`: out of scope for a pure version-bump pass
- Add `.ncurc`, Dependabot, or Renovate automation: recommended follow-up after this update
- Update `build.yml` workflow dispatch paths from old `packages/personalization` references: part of rebrand cleanup, separate concern

---

## Context & Research

### Relevant Code and Patterns

- Root `package.json` — 18 devDependencies, all caret ranges
- `apps/react-router/package.json` — 16 dependencies across React, react-router 7, Vite 5, TailwindCSS 3 ecosystem
- `apps/react/package.json` — 21 dependencies (UI widgets, ESLint plugins, Vite plugin)
- `apps/html/package.json` — single dep on `http-server`
- Existing plan at `docs/plans/2026-06-24-001-feat-rebrand-packages-experience-engine-plan.md`

### Institutional Learnings

- No `docs/solutions/` directory exists; no prior dependency-update learnings documented
- The rebrand plan explicitly notes that lockfile regeneration produces a large diff and considers this acceptable
- Both packages (`experience-engine`, `react`) have no unit tests — only Cypress E2E

### External References

- npm docs: `npm update` respects caret/tilde ranges with workspaces
- tsup 9 changelog (not yet released as of June 2026 — tsup 8 is current latest)
- Vite 6 migration guide (available on vite.dev)
- React 19 upgrade guide (react.dev)
- Cypress 16 migration guide (docs.cypress.io)

---

## Key Technical Decisions

- **Phase separation**: compatible updates first, major audit second. This avoids bundling low-risk minor bumps with potentially-breaking major changes in a single diff.
- **No `npm update` bulk command**: each `package.json` is updated independently so the diff per file is explicit and reviewable. After all edits, `npm install` regenerates the lockfile once.
- **Two-package audit → one-phase coverage**: the core and React packages have no updatable deps (core has zero deps; React has only a workspace dep and a peer dep). Both pass through trivially. All update work is in root + 3 apps.
- **High-friction criteria**: a major-version upgrade is flagged as high-friction when it requires config migration, breaks the existing API surface, changes peer dependency requirements, or has no compatible upgrade path for the current Node.js version (`>=20`).

---

## Implementation Units

### U1. Update root workspace devDependencies to latest compatible

**Goal:** Bump all root-level devDependencies to the latest version within their existing `^` ranges.

**Requirements:** R1, R4

**Dependencies:** None

**Files:**
- Modify: `package.json`

**Approach:**
- For each root devDependency, query npm for the latest version matching the existing major range
- Update the version string in `package.json`
- Do not change the version range prefix (retain `^`)
- Run `npm install` after all U1-U4 edits are complete (handled by U5)

**Test scenarios:**
- Happy path: Each updated version resolves to the latest within its major range (verify via `npm view <pkg> versions --json`)
- Edge case: A package has no newer compatible version — leave it unchanged and note it
- Edge case: A package's latest within-range version is a pre-release — skip unless the current version is also pre-release
- Integration: After `npm install`, `npm ls <pkg>` reports the expected new version

**Verification:**
- All version strings in `package.json` reflect the latest compatible minor/patch
- `npm install` succeeds without peer dependency conflicts

---

### U2. Update apps/react-router dependencies to latest compatible

**Goal:** Bump all deps and devDeps in the react-router test app to latest within `^` ranges.

**Requirements:** R1, R4

**Dependencies:** U1 (updates share the same lockfile — any order is fine; commit together with U1 for a clean atomic diff)

**Files:**
- Modify: `apps/react-router/package.json`

**Approach:**
- Update each dep: `@react-router/node`, `@react-router/serve`, `react-router`, `react`, `react-dom`, `isbot`, `@react-router/dev`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-basic-ssl`, `autoprefixer`, `postcss`, `tailwindcss`, `typescript`, `vite`, `vite-tsconfig-paths`
- Keep react-router ecosystem packages version-locked (all `@react-router/*` must be the same version)
- Update `@types/react` and `@types/react-dom` to match the React 18.x latest series (not React 19 types — that's for the major audit)

**Patterns to follow:**
- Existing caret ranges in `apps/react-router/package.json`

**Test scenarios:**
- Happy path: All react-router ecosystem packages (`react-router`, `@react-router/dev`, `@react-router/node`, `@react-router/serve`) resolve to the same version
- Happy path: `@types/react` matches the `react` major version (both 18.x)
- Edge case: `tailwindcss` 3.x latest includes PostCSS plugin API changes — verify PostCSS 8.x compatibility
- Integration: After U5, `npm run build -w react-router-app` succeeds

**Verification:**
- All version strings are updated to latest compatible
- react-router ecosystem versions are internally consistent

---

### U3. Update apps/react dependencies to latest compatible

**Goal:** Bump all deps and devDeps in the debug test app to latest within `^` ranges.

**Requirements:** R1, R4

**Dependencies:** U1

**Files:**
- Modify: `apps/react/package.json`

**Approach:**
- Update each dep: `@monaco-editor/react`, `@tanstack/react-table`, `react`, `react-dom`, `react-slider`, `react-switch`, `react-syntax-highlighter`, `react-tabs`, `@eslint/js`, `@types/react`, `@types/react-dom`, `@types/react-slider`, `@types/react-syntax-highlighter`, `@vitejs/plugin-react`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `typescript`, `typescript-eslint`, `vite`
- `@types/react` and `@types/react-dom` stay on 18.x for the compatible pass

**Patterns to follow:**
- Existing caret ranges in `apps/react/package.json`

**Test scenarios:**
- Happy path: `@vitejs/plugin-react` version is compatible with `vite` version (both on stable 5.x)
- Happy path: `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` are compatible with `eslint` 9.x
- Integration: After U5, `npm run build -w contensis-experience-engine-react-test-app` succeeds

**Verification:**
- All version strings updated
- The app builds without ESLint plugin compatibility errors

---

### U4. Update apps/html dependency to latest compatible

**Goal:** Bump `http-server` in the static HTML demo app.

**Requirements:** R1

**Dependencies:** U1

**Files:**
- Modify: `apps/html/package.json`

**Approach:**
- Update `http-server` to latest within `^14.x` range

**Test scenarios:**
- Happy path: Version number is updated; no further integration needed — this is a simple static server

**Verification:**
- Version string in `apps/html/package.json` reflects latest 14.x

---

### U5. Regenerate lockfile, build workspace, and verify integrity

**Goal:** After all version bumps (U1-U4), regenerate `package-lock.json`, build all packages, and verify the workspace is fully functional.

**Requirements:** R4, R5

**Dependencies:** U1, U2, U3, U4

**Files:**
- Modify: `package-lock.json` (automatically regenerated)
- Verify: All `dist/` directories are cleanly rebuilt

**Approach:**
- Run `npm install` to regenerate the lockfile with all updated versions
- Run `npm run build` to build all packages and apps
- Run `npm run typecheck -w react-router-app` to verify TypeScript compilation (it uses `noEmit` prebuild already)
- Verify the core package still has zero runtime dependencies: `npm ls --production --all` from `packages/experience-engine`
- Verify React bindings resolve the correct core engine version: `npm ls @contensis/experience-engine -w @contensis/experience-engine-react`

**Test scenarios:**
- Happy path: `npm install` completes without peer dependency conflicts
- Happy path: `npm run build` produces valid output for all packages
- Happy path: Core package has zero runtime dependencies after install
- Integration: `npm ls` shows all updated versions correctly resolved
- Error path: A peer dependency conflict surfaces during install — backtrack to identify which package update caused it and pin to the previous compatible version

**Verification:**
- `package-lock.json` diff shows only version bumps (no structural changes)
- Full workspace build produces no errors
- `npm ls --production --all -w @contensis/experience-engine` shows zero runtime deps

---

### U6. Audit major-version upgrades and flag high-friction updates

**Goal:** Research available major-version upgrades for every dependency, assess breaking-change impact, and produce a documented risk assessment.

**Requirements:** R3

**Dependencies:** U5 (want current state as baseline for comparison)

**Files:**
- Modify: no source files — output is documentation within this plan's findings

**Approach:**
- For each dependency, query npm for the latest version (any major)
- Categorize each into one of three tiers:
  - **Safe upgrade** — no breaking changes, or breaking changes don't affect this workspace's usage
  - **Needs testing** — breaking changes exist but migration is well-documented and low-complexity
  - **High-friction** — config rewrite required, plugin ecosystem breakage, or significant API surface changes
- For high-friction items, document: current version, target version, specific breaking changes, migration complexity estimate, and recommended timing
- Output as a structured table

**Test scenarios:**
- Happy path: Most dependencies are flagged "safe upgrade" (minor/patch bumps within existing ranges are already covered by U1-U4)
- Edge case: A dependency is abandoned or has no newer version — note it
- Edge case: A dependency's major version requires a higher Node.js version than `>=20` — flag as high-friction
- Integration: Cross-reference peer dependency compatibility for grouped ecosystems (react-router, React, ESLint plugins)

**Verification:**
- Every dependency from every `package.json` has an entry in the audit table
- High-friction items include specific rationale (not just "breaking changes")
- No behavioral changes are made to any source file

---

## High-Friction Dependency Audit (expected findings)

Based on research, the following upgrades are expected to be flagged as high-friction. Actual findings may differ after npm queries.

| Dependency | Current | Latest Major | Friction Level | Rationale |
|---|---|---|---|---|
| React 18 → 19 | `^18.3.1` | 19.x | **High** | New compiler, deprecated lifecycle methods, ref API changes, `useContext` behavior change. Requires testing all UI widgets and react-router 7 integration. |
| react-router 7 → 8 | `^7.9.4` | TBD | **High** | Major breaking changes expected in route definitions, loaders, actions, SSR. All `@react-router/*` packages must move in lockstep. |
| TailwindCSS 3 → 4 | `^3.4.18` | 4.x | **High** | Complete rewrite: CSS-first config, no `tailwind.config.ts`, new PostCSS plugin API. Full migration effort, recommended as separate work. |
| Cypress 15 → 16 | `^15.5.0` | 16.x | **High** | Config and API changes; entire test suite depends on Cypress. Must validate in isolation. |
| Vite 5 → 6 | `^5.4.21` | 6.x | **Medium** | Migration guide available; plugin compatibility (`@react-router/dev`, `@vitejs/plugin-react`, `@vitejs/plugin-basic-ssl`) must be verified. |
| tsup 8 → 9 | `^8.5.0` | 9.x (if released) | **Medium** | Core bundler; `--dts-resolve` behavior may change. Both packages depend on tsup for all output. |
| ESLint 9 → 10 | `^9.38.0` | 10.x (if released) | **Medium** | Flat config API may change; `typescript-eslint` compatibility required. |
| typescript-eslint 8 → 9 | `^8.46.1` | 9.x (if released) | **Medium** | Tied to TypeScript and ESLint versions; lockstep compatibility needed. |

---

## System-Wide Impact

- **Interaction graph:** No behavioral changes — version bumps only. The workspace's dependency graph is unaffected.
- **Error propagation:** Any build errors from version bumps are caught at `npm install` or `npm run build` time. No runtime impact.
- **State lifecycle risks:** None. No state management code is touched.
- **API surface parity:** The two published packages (`@contensis/experience-engine`, `@contensis/experience-engine-react`) expose no API changes. Consumer code is unaffected by dependency version bumps in devDependencies or app-level deps.
- **Integration coverage:** The sole test surface is Cypress E2E against the react-router app. All integration testing depends on these tests passing.
- **Unchanged invariants:** Core package has zero runtime dependencies. All existing semver ranges are preserved. No deprecations or removals.

---

## Risks & Dependencies

| Risk | Mitigation |
|---|---|
| Peer dependency conflict after update | Pin the problematic dep to previous version, flag in major audit |
| tsup type resolution breaks after minor update | Compare `.d.ts` output before/after; revert if type output changes |
| Cypress E2E tests flake after browser dep updates | Run full E2E suite in CI; compare against baseline run |
| `npm install` produces excessively large lockfile diff | Accept per rebrand plan precedent — lockfile diffs are expected |
| Workspace build succeeds but tree-shaking or bundle output changes | Verify bundle size and exports remain unchanged between builds |

---

## Documentation / Operational Notes

- After the compatible update pass (U1-U5), commit the changes before starting U6 (major audit). This gives a clean checkpoint to revert to if a major upgrade investigation causes issues.
- The major audit findings (U6) should be documented in a follow-up issue or as comments on the PR, not as inline changes to source code.
- Consider setting up Dependabot or Renovate after this update to prevent future drift. This is not part of the current plan scope but is a recommended follow-up.

---

## Sources & References

- Related code: `package.json` (root), `apps/react-router/package.json`, `apps/react/package.json`, `apps/html/package.json`
- Related plan: `docs/plans/2026-06-24-001-feat-rebrand-packages-experience-engine-plan.md`
