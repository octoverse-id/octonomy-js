# Contributing to octonomy-js

Thanks for contributing! This is the official TypeScript SDK for the Octonomy taxonomy service — a
hand-written, axios-based client. Please keep the runtime dependency surface minimal.

## Getting started

```bash
git clone https://github.com/octoverse-id/octonomy-js.git
cd octonomy-js
npm install
npm test
```

Requires Node 18+. axios is the only runtime dependency; everything else is a devDependency.

## Quality gates

Run these before opening a PR; CI runs the same checks and must pass before merge:

```bash
npm run lint        # Biome (lint + format check)
npm run typecheck   # tsc --noEmit
npm test            # Vitest
npm run build       # tsup (dual ESM + CJS + .d.ts)
```

`npm run check` bundles lint + typecheck + test; `make release-check` runs the full pre-release gate.
Apply formatting/lint fixes with `npm run format` or `npm run lint:fix`.

## Coding conventions

These mirror [AGENTS.md](AGENTS.md):

- `strict` TypeScript, **no `any`** (use `unknown` + narrowing from `src/internal.ts`).
- **axios is the only runtime dependency.**
- One file per resource service (`src/resources/*.ts`), reached from a property on `Octonomy`.
- Methods take required inputs first, `options?: RequestOptions` last; all return `Promise`.
- List methods return `Page<T>` parsed from the `{data, pagination}` envelope.
- Non-2xx responses reject with typed errors extending `ApiError`; never return error codes.
- Public types are camelCase; per-resource mappers translate to/from the snake_case wire format and
  omit `undefined` keys.
- Keep types faithful to `docs/openapi.yaml`; document any deliberate divergence.
- Every public export has a doc comment, and is re-exported from `src/index.ts`.

## Testing expectations

- Vitest + a mock axios adapter (`test/helpers.ts` → `makeClient`). Assert request
  method/path/headers/query/body and the decoded response.
- Cover success, the list envelope + camelCase mapping, and error→class mapping.

## Branches, commits, and PRs

- Branch names follow [Conventional Branch](https://conventional-branch.github.io/):
  `<type>/<description>`, types `feature|feat|bugfix|fix|hotfix|release|chore`.
- For planned work tracked by an issue, use `<type>/<issue-number>-<description>` and put
  `Closes #<n>` in the PR body.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/).
- Fill out the PR checklist (lint, typecheck, test, build, docs, CHANGELOG).

## Changelog and versioning

- Add a bullet under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for any user-facing change.
- **Do not** bump the version in feature/fix PRs. Version bumps happen only in a dedicated
  `release/<version>` PR — see [docs/versioning.md](docs/versioning.md) and
  [docs/release.md](docs/release.md).

## Security

Please report vulnerabilities privately — see [SECURITY.md](SECURITY.md). Do not open a public issue
for security problems.
