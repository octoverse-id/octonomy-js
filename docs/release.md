# Release Runbook

The SDK is published to npm as `@octoverse-id/octonomy` and tagged in git as `vX.Y.Z`.

## Versioning

See [versioning.md](versioning.md). `package.json` `version` is canonical; `src/version.ts` mirrors it;
`make version-check` keeps both in sync with the latest `CHANGELOG.md` heading.

## Pre-release gate

```bash
make release-check
```

This runs `lint` (Biome), `typecheck` (tsc), `test` (Vitest), `build` (tsup), and `version-check`.
All must pass.

## Cutting a release

1. **Branch:** `git switch -c release/<version>` (e.g. `release/0.2.0`).
2. **Bump the version:** update `version` in `package.json` **and** `VERSION` in `src/version.ts` to
   the new `X.Y.Z`.
3. **Update the CHANGELOG:** move `[Unreleased]` items under a new `## [X.Y.Z] - <date>` heading and
   refresh the compare links at the bottom.
4. **Run the gate:** `make release-check`.
5. **Open the release PR**, get it reviewed, and merge to `main`.
6. **Tag the merge commit and publish:**
   ```bash
   git tag -a v<version> -m "v<version>"
   git push origin v<version>
   npm publish --access public   # scoped package must be published as public
   gh release create v<version> --title "v<version>" --notes-from-tag
   ```
7. **Verify** the published package:
   ```bash
   npm view @octoverse-id/octonomy version
   ```
8. Close the milestone/issue and delete the release branch.

## Publishing notes

- `prepublishOnly` runs `npm run build`, so `dist/` is always rebuilt before publish.
- Only `dist/` ships (the `files` field); source, tests, and docs stay in the repo.
- The first publish requires npm auth with access to the `@octoverse-id` scope; consider an npm
  automation token in CI for subsequent releases.

## Server contract changes

If a release targets a new Octonomy server contract, refresh the vendored `docs/openapi.yaml`,
reconcile the model types/mappers, and update the "targeted server contract" note in
[versioning.md](versioning.md) in the same release PR.
