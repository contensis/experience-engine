# Contensis Personalization Monorepo

## Structure

npm workspaces monorepo. Two publishable libraries, three test/demo apps.

| Path | Package | Role |
|---|---|---|
| `packages/experience-engine` | `@contensis/experience-engine` | Core experience engine |
| `packages/react` | `@contensis/experience-engine-react` | React bindings, depends on core |
| `apps/react-router` | `react-router-app` | Main test app, target for Cypress e2e |
| `apps/react` | `contensis-personalization-react-test-app` | Debug/manifest playground |
| `apps/html` | `html-example` | Static HTML demo |

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install all workspace deps |
| `npm run build` | Build all packages (`tsup`, ESM + CJS + minified) |
| `npm start` | Dev server on **HTTPS** `localhost:5173` (self-signed cert — approve browser warning) |
| `npm run test` | Start dev server, then run Cypress e2e (Chrome + Edge + Firefox) |
| `npm run test:open` | Start dev server, open Cypress interactive |
| `npm run e2e:chrome` | Run only Chrome e2e |

### Per-package

```bash
npm run build -w @contensis/experience-engine
npm run build -w @contensis/experience-engine-react
npm run typecheck -w react-router-app
npm run dev -w contensis-personalization-react-test-app
```

## Build Details

- **Bundler**: tsup. `prebuild` runs `tsc --noEmit` for type checking.
- Core package produces two entrypoints: `.` (full) and `./browser` (browser-only). Each gets `.js`, `.mjs`, `.d.ts`, and minified variants.
- React package uses `--dts-resolve` to resolve cross-package types.
- `@contensis/experience-engine-react` depends on `@contensis/experience-engine >=1.0.0-beta.0` — build core first if both need rebuilding.

## E2E Testing

- Cypress 15, tests in `cypress/e2e/`. Target: `https://localhost:5173`.
- Uses `start-server-and-test` to boot the dev server before running tests.
- Tests run with `--record`; requires `CYPRESS_RECORD_KEY` in `.env`.
- Env vars loaded via `dotenvx` (`dotenvx run -- ...`).
- `chromeWebSecurity: false` — cross-origin requests are allowed.
- Fixtures in `cypress/fixtures/` contain manifest JSON files for audience/signal testing.

## Dev Server Gotchas

- The react-router app uses **self-signed HTTPS** via `@vitejs/plugin-basic-ssl`. You must approve the cert warning in your browser before e2e tests will work.
- Proxies `/contensis-preview-toolbar`, `/api/management`, `/api/preview-toolbar` to `preview-blockstesting-develop.cloud.contensis.com`.

## Release

- release-please manages versions for both packages. Separate PRs per package.
- Config: `release-please-config.json`. Manifest: `.release-please-manifest.json`.
- Commit types that generate changelog entries: `feat`, `fix`, `docs`, `build`, `revert`.

## Tech Stack

- TypeScript 5.9, ESLint 9 (flat config), tsup bundler
- React 18, react-router 7 (with SSR), Tailwind CSS
- Node >= 20
