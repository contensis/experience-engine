---
date: 2026-06-24
type: feat
status: completed
origin: docs/brainstorms/package-rebrand-experience-engine-requirements.md
---

# feat: Rebrand packages from `@contensis/personalization` to `@contensis/experience-engine`

## Summary

Rename the `@contensis/personalization` monorepo to `@contensis/experience-engine` — updating npm packages, GitHub repo, directory structure, internal identifiers, documentation, CI/CD, and release automation. Old npm betas will be deprecated with redirect notices. No behavioral changes to package logic.

---

## Problem Frame

The `@contensis/personalization` package brands itself narrowly as a personalization library, but its capabilities span a full DXP runtime — audience evaluation with boolean logic, 12+ signal operators, session/attribution tracking, manifest-driven rules, experiment bucketing, preview mode, and SPA navigation tracking. The name undersells the product and positions it against mature personalization tools rather than as a DXP engine component. The package has only published betas on npm and the repo is private, making this the ideal time to rebrand before a stable v1.0 release.

---

## Scope Boundaries

### In scope
- Rename npm packages: core (`@contensis/personalization` → `@contensis/experience-engine`), react (`@contensis/personalization-react` → `@contensis/experience-engine-react`)
- Rename GitHub repo from `contensis/personalization` to `contensis/experience-engine` (admin action — see Human Action List)
- Rename directory `packages/personalization/` → `packages/experience-engine/`; keep `packages/react/` directory name unchanged
- Rename root workspace name from `contensis-personalization` to `contensis-experience-engine-workspace`
- Rename test app workspace name from `contensis-personalization-react-test-app` to `contensis-experience-engine-react-test-app`
- Update tsup output names (`personalization` → `experience-engine`, `personalization-react` → `experience-engine-react`)
- Rename internal identifiers: global `CONTENSIS_PERSONALIZATION` → `CONTENSIS_XP`, interface `IContensisPersonalizationGlobals` → `IContensisExperienceEngineGlobals`, data attributes `data-contensis-personalization-*` → `data-contensis-xp-*`, log prefix `@contensis/personalization:` → `@contensis/experience-engine:`
- Rename exported API: `PersonalizationContext` → `ExperienceEngineContext`, `PersonalizationProvider` → `ExperienceEngineProvider`, `usePersonalizationContext` → `useExperienceEngineContext`, plus all related types (`PersonalizationContextOptions`, `PersonalizationProviderProps`, `PersonalizationReactContext`, `IPersonalizationReactContext`, `IPersonalizationStore`, `IPersonalizationSessionStore`)
- Update all documentation (6+ doc files, 3 READMEs, FAQs, manifest docs)
- Update CI/CD: release-please config, GitHub Actions artifact name and dispatch options, all GitHub repo URLs
- Update internal apps (html, react, react-router) with new import paths, globals, and data attrs
- Update Cypress tests (imports, type references, test descriptions)
- Deprecate old npm packages with redirect notices (`@contensis/personalization`, `@contensis/personalization-react`)
- Regenerate `package-lock.json` and verify `npm install && npm run build`

### Not in scope
- API endpoint path `/personalization/manifest/` — immutable Contensis server endpoint, kept unchanged
- Behavioral changes to evaluation, signal tracking, experiment bucketing, manifest resolution
- CI secrets, npm tokens, or environment configuration
- License files
- `react-router-app` workspace name in `apps/react-router/package.json` (not listed in requirements)

---

## Key Technical Decisions

1. **Full rename of internal identifiers** over minimal-change approach — chosen for consistency (see origin: `docs/brainstorms/package-rebrand-experience-engine-requirements.md:138`). The package has no known stable consumers relying on these identifiers.
2. **Global variable `CONTENSIS_XP`** over `CONTENSIS_EXPERIENCE_ENGINE` — shorter, dev-friendlier, while full names are used for types and log prefixes (see origin: line 139).
3. **Data attributes use `data-contensis-xp-*`** — matches the global shorthand (see origin: line 141).
4. **Exported types with "Personalization" prefix renamed** to use "ExperienceEngine" prefix per R27 — scoped to: `PersonalizationContextOptions`, `PersonalizationProviderProps` (and its variants `PersonalizationProviderContextProps`, `PersonalizationProviderInstantiationProps`), `PersonalizationReactContext`, `IPersonalizationReactContext`, `IPersonalizationStore`, `IPersonalizationSessionStore`. Types without a "Personalization" prefix (`IStoreOptions`, `IManifestClientArgs`, etc.) are not renamed.
5. **`@contensis/personalization` retained as npm keyword** — SEO/discoverability for old-name searchers (see origin: line 145).
6. **`packages/experience-engine` directory rename, `packages/react` kept as-is** — the React package directory name is already generic (see origin: line 146-147).
7. **File renames done via `git mv`** — preserves git history for all renamed files and directories.

---

## Implementation Units

### U1. Rename core package directory and update all package.json files

**Goal:** Rename the core package directory and update all package name, repository, homepage, and exports fields in `package.json` files across the monorepo.

**Requirements:** R1, R2, R3, R4, R5, R6, R9, R10, R13, R17

**Dependencies:** None

**Files:**
- `packages/personalization/package.json` — modify (directory rename via `git mv` first)
- `packages/react/package.json` — modify
- `package.json` (root) — modify
- `apps/react/package.json` — modify
- `apps/react-router/package.json` — modify
- `tsconfig.build.json` — modify path reference
- `release-please-config.json` — handled in U7

**Approach:**
- `git mv packages/personalization packages/experience-engine` to rename the directory with history preserved
- Update `packages/experience-engine/package.json`:
  - `name`: `@contensis/personalization` → `@contensis/experience-engine`
  - `repository.url`: `contensis/personalization.git` → `contensis/experience-engine.git`
  - `homepage`: update repo path from `/tree/main/packages/personalization` to `/tree/main/packages/experience-engine`
  - `main`, `module`, `types`, `exports.*`: update all `personalization` → `experience-engine` in dist filenames
  - `keywords`: keep `@contensis/personalization`, update others where appropriate
- Update `packages/react/package.json`:
  - `name`: `@contensis/personalization-react` → `@contensis/experience-engine-react`
  - `repository.url`: update to `contensis/experience-engine.git`
  - `homepage`: update repo path
  - `main`, `module`, `types`, `exports.*`: `personalization-react` → `experience-engine-react` in dist filenames
  - `dependencies["@contensis/personalization"]` → `dependencies["@contensis/experience-engine"]`
- Update root `package.json`:
  - `name`: `contensis-personalization` → `contensis-experience-engine-workspace`
- Update `apps/react/package.json`:
  - `name`: `contensis-personalization-react-test-app` → `contensis-experience-engine-react-test-app`
- Update `apps/react-router/package.json`:
  - `dependencies["@contensis/personalization-react"]` → `dependencies["@contensis/experience-engine-react"]`
- Update `tsconfig.build.json`: `"path": "packages/personalization"` → `"path": "packages/experience-engine"`

**Test scenarios:**
- Verify all six `package.json` files have correct new names and dependency references
- Verify `npm install` completes without errors after package.json changes
- Verify `npm ls` shows `@contensis/experience-engine` and `@contensis/experience-engine-react` as resolved workspace packages

**Verification:** `npm install` succeeds; `npm ls -a` shows new package names.

---

### U2. Update tsup build configurations

**Goal:** Update tsup output names so build artifacts use the new package names.

**Requirements:** R15, R16

**Dependencies:** U1 (directory rename must be complete)

**Files:**
- `packages/experience-engine/tsup.config.ts` — modify
- `packages/react/tsup.config.ts` — modify

**Approach:**
- In `packages/experience-engine/tsup.config.ts`:
  - Change output name variable: `personalization` → `experience-engine`
  - Change browser entrypoint key: `personalization.browser` → `experience-engine.browser`
- In `packages/react/tsup.config.ts`:
  - Change output name variable: `personalization-react` → `experience-engine-react`

**Test scenarios:**
- `npm run build -w @contensis/experience-engine` produces `dist/experience-engine.js`, `dist/experience-engine.mjs`, `dist/experience-engine.d.ts`, `dist/experience-engine.min.js`, `dist/experience-engine.min.mjs`, `dist/experience-engine.browser.js`, `dist/experience-engine.browser.mjs`, `dist/experience-engine.browser.min.js`, `dist/experience-engine.browser.min.mjs`
- `npm run build -w @contensis/experience-engine-react` produces `dist/experience-engine-react.js`, `dist/experience-engine-react.mjs`, `dist/experience-engine-react.d.ts`, `dist/experience-engine-react.d.mts`

**Verification:** Build artifacts exist under new filenames; can `npm run build` from repo root.

---

### U3. Rename internal global constant, type declarations, and identifiers

**Goal:** Update the `GLOBAL` constant value, global type declarations, and the globals interface. Update log prefix and all source files that reference the old names internally.

**Requirements:** R18, R19, R21, R22, R26, R27 (partial — `IPersonalizationStore`, `IPersonalizationSessionStore`)

**Dependencies:** U1 (directory rename), U2 (build output names set)

**Files:**
- `packages/experience-engine/src/personalization.ts` — rename to `experience-engine.ts`; modify: `GLOBAL` constant value `"CONTENSIS_PERSONALIZATION"` → `"CONTENSIS_XP"`, class name `PersonalizationContext` → `ExperienceEngineContext`, type `PersonalizationContextOptions` → `ExperienceEngineContextOptions`
- `packages/experience-engine/src/models/global.d.ts` — modify: global var name, import path, interface reference
- `packages/experience-engine/src/models/IContensisPersonalizationGlobals.d.ts` — rename to `IContensisExperienceEngineGlobals.d.ts`; modify interface name and import
- `packages/experience-engine/src/models/PersonalizationStore.d.ts` — rename to `ExperienceEngineStore.d.ts`; modify `IPersonalizationStore` → `IExperienceEngineStore`, `IPersonalizationSessionStore` → `IExperienceEngineSessionStore`
- `packages/experience-engine/src/models/index.ts` — modify: export paths for renamed files
- `packages/experience-engine/src/models/IHandlers.ts` — modify: `PersonalizationContext` import
- `packages/experience-engine/src/logs.ts` — modify: `messages.pre` value
- `packages/experience-engine/src/audiences.ts` — modify: `PersonalizationContext` import
- `packages/experience-engine/src/session.ts` — modify: `PersonalizationContext` import
- `packages/experience-engine/src/providers/manifest.ts` — modify: `PersonalizationContext` import
- `packages/experience-engine/src/providers/manifest-client.ts` — modify: `GLOBAL` import
- `packages/experience-engine/src/providers/store.ts` — modify: store key `"cp"` → `"cxp"`, `IPersonalizationStore`, `IPersonalizationSessionStore` imports
- `packages/experience-engine/src/signals/index.ts` — modify: `PersonalizationContext` import
- `packages/experience-engine/src/util.ts` — modify: imports from models if affected
- `packages/experience-engine/src/index.ts` — modify: import path for renamed `personalization.ts` → `experience-engine.ts`, `PersonalizationContext` export reference

**Approach:**
- Use `git mv` for file renames (`personalization.ts` → `experience-engine.ts`, `IContensisPersonalizationGlobals.d.ts` → `IContensisExperienceEngineGlobals.d.ts`, `PersonalizationStore.d.ts` → `ExperienceEngineStore.d.ts`)
- Update all imports across the codebase to use new file paths and new export names
- Update `GLOBAL` constant value — this changes the runtime global variable name on `window`
- Update all references to `PersonalizationContext` (as a type and class) to `ExperienceEngineContext`
- Update all references to `PersonalizationContextOptions` to `ExperienceEngineContextOptions`
- Update `IPersonalizationStore` → `IExperienceEngineStore`, `IPersonalizationSessionStore` → `IExperienceEngineSessionStore`
- Update log prefix string: `@contensis/personalization:` → `@contensis/experience-engine:`
- Rename `cpid` property to `cxpid` (`ExperienceEngineContext.cpid` → `ExperienceEngineContext.cxpid` — affects `experience-engine.ts` and all consumers)
- Rename store key from `"cp"` to `"cxp"` in `packages/experience-engine/src/providers/store.ts`

**Test scenarios:**
- `GLOBAL` constant resolves to `"CONTENSIS_XP"` at runtime
- `window.CONTENSIS_XP` hosts the engine globals after initialization (covers AE3)
- `ExperienceEngineContext` class is constructable and provides the same API surface as the old `PersonalizationContext`
- Console log messages use prefix `@contensis/experience-engine:`
- `ExperienceEngineContext.cxpid` is populated and returns a string (tests rename from `cpid`)
- Store key `"cxp"` is used in localStorage/sessionStorage (tests rename from `"cp"`)
- TypeScript build (`tsc --noEmit`) passes with no errors

**Verification:** `npm run build -w @contensis/experience-engine` succeeds; `tsc --noEmit` passes.

---

### U4. Rename exported API classes, components, and hooks (React package)

**Goal:** Rename all exported React API surfaces — components, hooks, context, and their associated types.

**Requirements:** R23, R24, R25, R27 (partial — React types)

**Dependencies:** U3 (core class `PersonalizationContext` renamed to `ExperienceEngineContext`)

**Files:**
- `packages/react/src/context/PersonalizationReactContext.tsx` — rename to `ExperienceEngineReactContext.tsx`; modify interface `IPersonalizationReactContext` → `IExperienceEngineReactContext`, const export name
- `packages/react/src/context/PersonalizationProvider.tsx` — rename to `ExperienceEngineProvider.tsx`; modify component name, type names (`PersonalizationProviderProps`, `PersonalizationProviderContextProps`, `PersonalizationProviderInstantiationProps`), `GLOBAL` constant value, imports
- `packages/react/src/hooks/usePersonalizationContext.tsx` — rename to `useExperienceEngineContext.tsx`; modify hook function name, imports, error message text
- `packages/react/src/components/Personalize.tsx` — modify: import paths (type references only — component name stays `Personalize`)
- `packages/react/src/components/Experiment.tsx` — modify: import paths if affected
- `packages/react/src/index.tsx` — modify: re-export paths for renamed files
- `packages/react/src/global.d.ts` — modify: import paths for new globals type

**Approach:**
- Use `git mv` for file renames
- Component `Personalize` keeps its name (it doesn't use a "Personalization" prefix — the filename `PERSONALIZE.md` gets renamed in U6)
- Component `Experiment` keeps its name unchanged
- All imports from the renamed files must be updated across consumer apps and tests

**Test scenarios:**
- `ExperienceEngineProvider` renders without error and provides context to children
- `useExperienceEngineContext` hook returns the same state shape as the old `usePersonalizationContext`
- Error message in hook reads: `"useExperienceEngineContext must be used within a <ExperienceEngineProvider> provider"`
- Both `Personalize` and `Experiment` components continue to function with renamed context/hook
- TypeScript build (`tsc --noEmit`) passes for both packages

**Verification:** `npm run build -w @contensis/experience-engine-react` succeeds.

---

### U5. Update browser entrypoint and HTML data attributes

**Goal:** Update the browser auto-initialization entrypoint to use the new global name and data attribute prefix.

**Requirements:** R20, R18 (global on browser.ts side)

**Dependencies:** U3 (GLOBAL constant, ExperienceEngineContext class)

**Files:**
- `packages/experience-engine/src/browser.ts` — modify: data attribute prefix string, imports

**Approach:**
- Change `getDataAttributeName` return value from `` `data-contensis-personalization-${dataId}` `` to `` `data-contensis-xp-${dataId}` ``
- The `GLOBAL` constant already updated in U3 to `"CONTENSIS_XP"` — verify `w[GLOBAL]` references work correctly with the new value
- Update imports from renamed class names (`PersonalizationContext` → `ExperienceEngineContext`, `PersonalizationContextOptions` → `ExperienceEngineContextOptions`)

**Test scenarios:**
- Browser auto-init reads `data-contensis-xp-alias`, `data-contensis-xp-root-url`, etc. from script element
- Browser auto-init reads `window.CONTENSIS_XP` global pre-sets correctly
- Backward compat: old `data-contensis-personalization-*` attributes are NOT recognized (this is intentional — consumers must update their HTML)

**Verification:** Build succeeds; the browser entrypoint produces bundles with updated attribute handling.

---

### U6. Update all documentation files

**Goal:** Update every README and documentation file to use new package names, repo URLs, class/component/hook names, and import examples.

**Requirements:** R28, R29, R30, R31, R32, R33, R34, R35, R36, R37, R38

**Dependencies:** U1, U3, U4 (the new names must be known before docs can reference them)

**Files:**

**READMEs:**
- `README.md` (root) — modify: heading, description, badges, repo URLs
- `packages/experience-engine/README.md` — modify: package name, npm install commands, CDN URLs, repo URLs, data attr references, global references, example code
- `packages/react/README.md` — modify: package name, npm install commands, import examples, component/hook names, repo URLs
- `apps/README.md` — modify: repo URLs for app directory links, package name references
- `AGENTS.md` — modify: package names, directory paths, workspace references, per-package commands

**Core docs:**
- `packages/experience-engine/docs/PERSONALIZATION_CONTEXT.md` — rename to `EXPERIENCE_ENGINE_CONTEXT.md`; update repo URLs, class name references, document title, npm install commands
- `packages/experience-engine/docs/EVENT_HANDLERS.md` — modify: doc-internal references, class name references, repo URLs

**React docs:**
- `packages/react/docs/PERSONALIZATION_PROVIDER.md` — rename to `EXPERIENCE_ENGINE_PROVIDER.md`; update repo URLs, component name references, document title
- `packages/react/docs/USE_PERSONALIZATION_CONTEXT.md` — rename to `USE_EXPERIENCE_ENGINE_CONTEXT.md`; update repo URLs, hook name references, document title
- `packages/react/docs/PERSONALIZE.md` — rename to `EXPERIENCE_ENGINE.md`; update internal references, repo URLs

**Shared docs:**
- `docs/MANIFEST.md` — modify: repo URL references, document title references, class name references
- `docs/FAQS.md` — modify: repo URL references, "Personalization Context" references


**Approach:**
- Use `git mv` for file renames
- Replace all `github.com/contensis/personalization` → `github.com/contensis/experience-engine`
- Replace all package name references with new names
- Replace all component/hook/class names in prose and code examples
- Update shield.io badge URLs for npm, license, etc.
- Update CDN unpkg URLs to new package names
- Update import examples

**Test scenarios:**
- All repo URLs in all docs resolve to the new `contensis/experience-engine` repo (link-check, not automated)
- No stale references to `@contensis/personalization`, `@contensis/personalization-react`, `CONTENSIS_PERSONALIZATION`, `PersonalizationContext`, `PersonalizationProvider`, or `usePersonalizationContext` remain in any doc file
- `git grep -i personalization docs/ packages/*/docs/` returns only the retained keyword entry and the deprecated package references

**Verification:** grep for stale references across all doc files returns zero matches (excluding intentional keyword and deprecation notice references).

---

### U7. Update CI/CD and release configuration

**Goal:** Update release-please config and GitHub Actions workflow with new package names, component names, and artifact names.

**Requirements:** R39, R40

**Dependencies:** U1 (package.json names must reflect the rename before CI config references them)

**Files:**
- `release-please-config.json` — modify: `packages["packages/personalization"]` path → `packages["packages/experience-engine"]`, `component` values update
- `.release-please-manifest.json` — modify: package path key update if populated
- `.github/workflows/build.yml` — modify: dispatch option labels, artifact name

**Approach:**
- In `release-please-config.json`:
  - `packages["packages/personalization"]` → `packages["packages/experience-engine"]`
  - `component: "@contensis/personalization"` → `component: "@contensis/experience-engine"`
  - `packages["packages/react"]` component: `"@contensis/personalization-react"` → `"@contensis/experience-engine-react"`
- In `.github/workflows/build.yml`:
  - Dispatch options `["packages/personalization"]` → `["packages/experience-engine"]`
  - Artifact name `contensis-personalization-packages` → `contensis-experience-engine-packages`

**Test expectations: none — CI config changes are verified by workflow rendering and subsequent PR runs**

**Test scenarios:**
- Release-please JSON is valid (validates against schema)
- GitHub Actions workflow file is valid YAML

**Verification:** `npm install` succeeds; workflow file remains valid YAML.

---

### U8. Update internal apps

**Goal:** Update all internal demo/test apps to use renamed packages, globals, and data attributes.

**Requirements:** R41, R42, R45

**Dependencies:** U3 (core class/global renames), U4 (React package renames), U5 (data attribute prefix change)

**Files:**

**`apps/html/`:**
- `apps/html/index.html` — modify: `CONTENSIS_PERSONALIZATION` → `CONTENSIS_XP`, `personalization.js` → `experience-engine.js` script src, data attributes
- `apps/html/page1.html` — modify: script src path
- `apps/html/experiment-content.html` — modify: `CONTENSIS_PERSONALIZATION`, script src
- `apps/html/custom-attributes.html` — modify: `personalization.js`, dist path, `data-contensis-personalization-*` → `data-contensis-xp-*`, `CONTENSIS_PERSONALIZATION`
- `apps/html/entry-content.html` — modify: script src, `CONTENSIS_PERSONALIZATION`
- `apps/html/arts/index.html` — modify: dist path (personalization.browser.min.mjs → experience-engine.browser.min.mjs), data attributes
- `apps/html/personalization.js` — rename; modify: data attribute strings, import paths

**`apps/react/`:**
- `apps/react/tsconfig.json` — modify: path aliases (`@contensis/personalization` → `@contensis/experience-engine`, `@contensis/personalization-react` → `@contensis/experience-engine-react`)
- `apps/react/src/App.tsx` — modify: imports
- `apps/react/src/ReactApp.tsx` — modify: imports
- `apps/react/src/ContentPage.tsx` — modify: imports
- `apps/react/src/util.ts` — modify: imports
- `apps/react/src/components/DebugPanel.tsx` — modify: imports
- `apps/react/src/components/Overview.tsx` — modify: imports
- `apps/react/src/components/Signals.tsx` — modify: imports
- `apps/react/src/components/Audiences.tsx` — modify: imports
- `apps/react/src/components/Attributes.tsx` — modify: imports
- `apps/react/src/components/Manifest.tsx` — modify: imports
- `apps/react/src/mock/mock-manifest.ts` — modify: imports

**`apps/react-router/`:**
- `apps/react-router/app/root.tsx` — modify: imports (`PersonalizationProvider` → `ExperienceEngineProvider`, `usePersonalizationContext` → `useExperienceEngineContext`)
- `apps/react-router/app/audiences.tsx` — modify: imports
- `apps/react-router/app/welcome/index.tsx` — modify: imports
- `apps/react-router/app/mocks/manifest-1.ts` — modify: imports

**Approach:**
- For `apps/html/personalization.js`, decide whether to rename the file or keep the existing name as a reference point. The script is loaded by HTML files; since HTML files also update their script src paths, rename to `experience-engine.js` for consistency.
- Update all HTML dist-file paths from `personalization` → `experience-engine` in script URLs
- Update all data attributes from `data-contensis-personalization-*` → `data-contensis-xp-*`
- Update all `CONTENSIS_PERSONALIZATION` global references → `CONTENSIS_XP`
- Update all TypeScript imports in React apps to use new package names and new export names

**Test scenarios:**
- `apps/html/index.html` loads with new script names and data attributes — no console errors
- `apps/react` dev server starts and renders without import errors
- `apps/react-router` dev server starts and renders without import errors
- All imported symbols (`ExperienceEngineProvider`, `useExperienceEngineContext`, `ExperienceEngineContext`) resolve correctly

**Verification:** `npm run build` from root succeeds; both react apps compile without errors.

---

### U9. Update Cypress tests and support files

**Goal:** Update all Cypress test files and support configuration to use renamed packages, types, and imports.

**Requirements:** R43, R44

**Dependencies:** U3 (core type renames), U4 (React package renames), U8 (internal apps — dev server must serve renamed imports)

**Files:**
- `cypress/e2e/audiences.cy.ts` — modify: imports (`PersonalizationContext` → `ExperienceEngineContext`), test descriptions referencing "personalization"
- `cypress/e2e/context.initialisation.cy.ts` — modify: test descriptions with "Personalisation" → "Experience Engine"
- `cypress/e2e/context.reset.cy.ts` — modify: test descriptions
- `cypress/e2e/signals.custom.cy.ts` — modify: imports (`ComputedSignal` from new package)
- `cypress/e2e/signals.page.cy.ts` — modify: imports (`PersonalizationContext` → `ExperienceEngineContext`)
- `cypress/e2e/storage.shrink.cy.ts` — modify: test description
- `cypress/support/commands.ts` — modify: imports from `@contensis/experience-engine`, `CONTENSIS_PERSONALIZATION` type reference → `CONTENSIS_XP`, comments referencing "personalisation"
- `cypress/support/index.d.ts` — modify: `/// <reference types="@contensis/experience-engine" />`
- `cypress/tsconfig.json` — modify: types include `@contensis/experience-engine`, path alias updates

**Approach:**
- Update all import paths from `@contensis/personalization` to `@contensis/experience-engine`
- Update all references to `CONTENSIS_PERSONALIZATION` type to `CONTENSIS_XP`
- Update test descriptions from "personalization"/"Personalization" to "experience engine"/"Experience Engine" (preserving British spelling "personalisation" in `context.initialisation.cy.ts` where present)
- Update type reference line in `cypress/support/index.d.ts`
- Update `cypress/tsconfig.json` path aliases and types arrays

**Test scenarios:**
- Cypress type checking passes (`npx tsc --noEmit -p cypress/tsconfig.json` or similar)
- Cypress test titles use new naming: "signals are computed with the experience engine context", etc.
- All imports resolve to the new `@contensis/experience-engine` and `@contensis/experience-engine-react` packages

**Verification:** `npx cypress run --spec` (or the equivalent check) reports no module resolution errors.

---

### U10. Regenerate lockfile, verify build, deprecate old packages

**Goal:** Complete the rename by regenerating `package-lock.json`, verifying the full build pipeline, and deprecating old npm packages.

**Requirements:** R7, R8, R47, R48

**Dependencies:** All prior units (U1–U9)

**Files:**
- `package-lock.json` — regenerate (via `npm install`)

**Approach:**
- Run `npm install` from repo root to regenerate `package-lock.json` with all new package names
- Verify `npm run build` passes across all workspace packages
- First publish under new names must use `npm publish --access public` on `@contensis` org

**Test scenarios:**
- `npm install` completes without errors
- `npm run build` completes without errors (covers AE1 — artifacts with new filenames exist)
- `git diff --stat` on `package-lock.json` shows only expected changes (name substitutions, not content changes)
- `git status` shows no uncommitted changes outside the lockfile

**Verification:** `npm install && npm run build` passes from clean checkout.

---

## Dependencies and Sequencing

```
U1 (package.json + dir rename)
  |
  v
U2 (tsup configs)
  |
  +---> U3 (core identifiers, globals, logs)
  |       |
  |       +---> U4 (React API renames)
  |       |       |
  |       |       +---> U5 (browser entry + data attrs)
  |       |       |
  |       |       v
  |       |   U6 (documentation)
  |       |   U7 (CI/CD)
  |       |   U8 (internal apps)  <-- depends on U3, U4, U5
  |       |   U9 (Cypress tests)  <-- depends on U3, U4
  |       |       |
  |       |       v
  |       |   U10 (lockfile, build verify, deprecate)
  |       |
  |       v
  +-----> U6, U7, U8, U9
```

U1 and U2 are the foundation — all other units build on the renamed directory structure. U3 and U4 are the core of the rename (API surfaces). U5 extends the core rename into the browser surface. U6, U7, and U9 are parallelizable after U3/U4 are complete. U8 depends on U5 (for the browser entrypoint) and cannot start before it. U10 is the final verification and publishing step.

---

## System-Wide Impact

- **npm consumers**: Will need to update dependencies from `@contensis/personalization` to `@contensis/experience-engine` (and React variant). Old betas deprecate with redirect.
- **Team developers**: Must update imports in any downstream project consuming the renamed packages. All file paths and type names change.
- **Operations**: GitHub repo rename requires admin access on the `contensis` org. npm publish under new names requires org-level permissions. Release-please config must match new package paths.
- **CI/CD**: GitHub Actions workflow dispatch options change. Artifact name changes. The Cypress Dashboard project may need parallel rename for recording to continue working.
- **Contensis server**: API endpoint `/personalization/manifest/` is unchanged — no server-side impact.

---

## Human Action List

These tasks require manual admin action outside the code implementation. They cannot or should not be performed by an automated agent.

| Action | When | Who | Details |
|---|---|---|---|
| Rename GitHub repo | Before or after code PR (see Risk) | GitHub admin on `contensis` org | Rename `contensis/personalization` → `contensis/experience-engine`. All code URLs already point to the new name; they will resolve after rename completes. |
| Deprecate old npm packages | After publish under new names | npm publisher with access | `npm deprecate @contensis/personalization "This package has been renamed to @contensis/experience-engine. Please update your dependencies."` Same for `@contensis/personalization-react`. |
| Verify npm publish access | Before first publish | npm publisher with access | Ensure the `@contensis` org allows publishing under the new package names. First publish must use `npm publish --access public`. |
| Rename Cypress Dashboard project | Before or after code PR | Cypress org admin | The CI records to Cypress Cloud under the old project name. Rename the project to match the new repo name, or the recording key may need updating. |
| Verify no external consumers | Before deprecating old packages | Team member | Run `npm view @contensis/personalization` to check for dependents. If unknown consumers exist, coordinate deprecation timing. |

---

## Deferred to Follow-Up Work

- Renaming the Cypress Dashboard project to match the new repo name (requires UI action on cypress.io, not a code change)
- Adding a redirect package or proxy at the old npm names (deprecation message is sufficient for beta-stage packages)
- Documenting the rename approach as an institutional learning via `/ce-compound`

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Missed "personalization" reference in an obscure file | Medium | Low | Use `git grep -i personalization` across repo after all units complete; verify zero matches (excluding intentional keyword + API path) |
| `package-lock.json` merge conflicts | High (expected) | Low | Large diff is expected and acceptable per requirements; regenerate at end and commit as a single change |
| GitHub repo rename breaks CI on the same PR | Medium | Medium | Rename repo before or after the code PR (see Human Action List); update all URLs in code to point to new repo name before it exists (they'll resolve after rename) |
| npm publish fails due to org permissions | Low | High | Verify `@contensis` org publish access before first publish attempt |
| External consumers on beta packages | Low | Medium | Verify no downstream dependents via `npm view @contensis/personalization` before deprecating |
| tsconfig path aliases break after directory rename | Low | High | Update all `tsconfig.json` files in U1; verify `tsc --noEmit` passes for all packages |
