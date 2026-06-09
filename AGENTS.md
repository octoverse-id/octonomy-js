# Octonomy TypeScript SDK — Agent Instructions

`octonomy-js` (npm: `@octoverse-id/octonomy`) is the official TypeScript client SDK for
[Octonomy](https://github.com/octoverse-id/octonomy), a multi-tenant, multi-application tag management /
taxonomy service. The SDK is a hand-written, axios-based client for the stable REST **v1** API
(`/api/v1`), published as dual ESM + CJS.

## Product Rules

These mirror server semantics the client must respect — business rules live on the server; the SDK
stays a faithful, ergonomic client.

- The SDK adds ergonomics, not behavior. Do not encode server-side validation or invariants here.
- Every request is tenant-scoped via the `X-Tenant-ID` header; `tenantId` is required config.
- `applicationId` is optional on tags and vocabularies (`null` = shared across the tenant) and is
  required for assignments.
- Tag deletion is **deactivation** on the server, not a hard delete. `delete()` methods call HTTP
  `DELETE` and must document the deactivation semantics rather than implying data loss.
- Tag aliases are alternate identifiers that resolve to canonical tags and follow tenant/application
  compatibility rules.
- Keep the SDK faithful to `docs/openapi.yaml`, the bundled contract reference. Where the live server
  diverges from the generated spec — notably the `{data, pagination}` list envelope the spec omits —
  trust the server's real behavior and document the divergence in a comment.

## API Client Rules

- One file per resource service (`src/resources/<name>.ts`), reached from a property on `Octonomy`.
- Methods take required inputs first and an optional `options?: RequestOptions` last; all return
  `Promise`.
- List methods return `Page<T>` parsed from the `{data, pagination}` envelope.
- Non-2xx responses reject with a typed error extending `ApiError` (`NotFoundError`, `ConflictError`,
  `ValidationError`, `AuthenticationError`, `ForbiddenError`); callers use `instanceof` or `isApiError`.
  The SDK never returns error codes.
- Public types are **camelCase**; per-resource `fromApi`/`*ToApi`/`listToQuery` mappers translate
  to/from the API's snake_case wire format. Input mappers omit `undefined` keys so PATCH sends only
  what's set. Response timestamps are parsed to `Date`.
- No new public export without a doc comment and tests.

## TypeScript Conventions

- `strict` TypeScript with `noUncheckedIndexedAccess`; **no `any`** (Biome enforces). Prefer `unknown`
  + narrowing (see `src/internal.ts`).
- Named exports only; the public surface is re-exported from `src/index.ts`.
- **axios** is the only runtime dependency. Dev tools (typescript, tsup, vitest, @biomejs/biome) are
  devDependencies.
- Keep the tree Biome-clean (lint + format) and type-clean (`tsc --noEmit`).
- The library throws typed errors; it never logs or calls `process.exit`.
- When changing a non-obvious mapping or semantic, add a comment explaining why.

## Testing Expectations

- Vitest with a mock axios adapter (see `test/helpers.ts` → `makeClient`). Assert the request method,
  path, auth headers (`Authorization`, `X-Tenant-ID`), query params, and JSON body; assert the decoded
  model / `Page` on the response side.
- Cover success paths, the `{data, pagination}` list envelope + camelCase mapping, and error→class
  mapping (404 → `NotFoundError`, 409 → `ConflictError`, 400 → `ValidationError`).

## Local Development

- Run `make check` before pushing and `make release-check` before a release.
- Keep the README quickstart, `examples/quickstart.ts`, and `package.json`/`Makefile` scripts current
  with the public API.
- Refresh the vendored `docs/openapi.yaml` from the Octonomy server when targeting a new contract, and
  record the server version it tracks in `docs/versioning.md`.

## Development Pipeline

- Branch names must follow Conventional Branch naming from
  https://conventional-branch.github.io/.
- Use `<type>/<description>` with lowercase alphanumerics, hyphens, and dots only where valid.
- Allowed branch types are `feature`, `feat`, `bugfix`, `fix`, `hotfix`, `release`, and `chore`.
- Example branch names: `feature/tag-assignments`, `fix/pagination-decode`, `chore/update-agent-rules`.
- When the user explicitly asks to implement an approved development plan, such as
  `PLEASE IMPLEMENT THIS PLAN`, create a GitHub issue before creating the development branch.
- If the user provides an existing issue number, use that issue instead of creating a duplicate.
- New plan-tracking issues must include the plan summary, key implementation tasks, and acceptance
  checks.
- If GitHub issue creation fails, stop and report the blocker instead of implementing untracked work.
- Planned-development branches must include the issue number using
  `<type>/<issue-number>-<short-description>`, for example `feature/12-tag-assignments`.
- PR bodies for planned development must include `Closes #<issue-number>` and summarize how the
  implementation maps back to the approved plan.
- Releases follow Semantic Versioning: cut them with the runbook in `docs/release.md` and the policy
  in `docs/versioning.md`. The SDK version lives in `package.json` (and mirrored in `src/version.ts`)
  and is published as a git tag `vX.Y.Z` + `npm publish`. Version bumps and tags happen only in a
  dedicated `release/<version>` PR, never in feature or fix PRs.
- The `code-review/` directory is reserved for local code review pipeline artifacts.
- Review agents must write findings to `code-review/findings.md`.
- Patch agents must read `code-review/findings.md`, apply valid fixes, and write the patch summary to
  `code-review/patches.md`.
- Agents must never stage or commit `code-review/findings.md`, `code-review/patches.md`, or any other
  generated review artifact.
- After creating a PR, remove all local files under `code-review/` except the tracked
  `code-review/.gitkeep` placeholder.

## Web Browsing

- Use the `/browse` skill from gstack for all web browsing.
- Do not use `mcp__claude-in-chrome__*` tools.
