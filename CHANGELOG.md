# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Breaking:** the minimum supported Node version is now 20 (`engines.node: ">=20"`). Node 18
  reached end-of-life in April 2025 and the test runner no longer starts on it. The CI matrix now
  covers Node 20, 22, and 24, and the bundle targets `node20`.

## [0.1.0] - 2026-06-09

Initial release of the Octonomy TypeScript SDK. Targets the stable Octonomy REST **v1** API
(server release `1.0.0`, served under `/api/v1`). axios is the only runtime dependency; published as
dual ESM + CJS with type declarations.

### Added
- Client foundation: `Octonomy` with config validation, an axios-backed transport that sets
  `Authorization`, `X-Tenant-ID`, optional `X-Actor-ID`, `Accept`, and `User-Agent`, an injectable
  axios `adapter`, and per-call `RequestOptions` (`actorId`, `signal`).
- Typed error classes: `ApiError` (with `statusCode`, `code`, `details`, `requestId`) and
  `NotFoundError`, `ConflictError`, `ValidationError`, `AuthenticationError`, `ForbiddenError`, plus
  `OctonomyError`, `OctonomyConfigError`, `OctonomyTransportError`, the `isApiError` guard, and
  `ErrorCode` constants — decoded from the `{error:{code,message,details,request_id}}` envelope.
- Pagination: generic `Page<T>` and `Pagination` parsed from the `{data, pagination}` envelope.
- `VocabularyService` (`client.vocabularies`): create, get, list, update, delete.
- `TagService` (`client.tags`): create, get, list (full filter set), update, delete.
- camelCase public types with per-resource mappers to/from the snake_case wire format; timestamps
  parsed to `Date`.
- Runnable `examples/quickstart.ts` and a vendored `docs/openapi.yaml` contract reference.

[Unreleased]: https://github.com/octoverse-id/octonomy-js/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/octoverse-id/octonomy-js/releases/tag/v0.1.0
