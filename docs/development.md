# Development

## Setup

```bash
git clone https://github.com/octoverse-id/octonomy-js.git
cd octonomy-js
npm install
npm test
```

Requires Node 18+. axios is the only runtime dependency; dev tools (TypeScript, tsup, Vitest, Biome)
install with `npm install`.

## Quality gates

```bash
npm run lint        # Biome (lint + format check)
npm run lint:fix    # apply lint fixes
npm run format      # apply formatting
npm run typecheck   # tsc --noEmit
npm test            # Vitest
npm run build       # tsup -> dual ESM + CJS + .d.ts
npm run check       # lint + typecheck + test (fast pre-push gate)
```

`make release-check` runs the full pre-release gate (lint + typecheck + test + build + version-check).

## Testing approach

Tests use a mock axios adapter (via `test/helpers.ts` → `makeClient`) so no network is involved:

- **Request side:** method, full URL, `Authorization` and `X-Tenant-ID` headers, query params, and
  JSON body — read back through `lastRequest`, `query`, `jsonBody`, `header`.
- **Response side:** the decoded model / `Page`, camelCase mapping, and error→class assertions via
  `rejects.toBeInstanceOf(...)` or a try/catch on `ApiError`.

Tests live in `test/*.test.ts` and run under Vitest.

## Running against a local Octonomy

Start an Octonomy server (see that repo's README), create a service token, then run the example:

```bash
OCTONOMY_BASE_URL=http://localhost:8000 \
OCTONOMY_TOKEN=svc_... \
OCTONOMY_TENANT_ID=acme \
npx tsx examples/quickstart.ts
```

## Keeping the contract current

`docs/openapi.yaml` is vendored from the Octonomy server. When targeting a new server contract, refresh
it (regenerate on the server with `make openapi`, copy the file here), reconcile the model types and
mappers, and note the server version in [versioning.md](versioning.md).
