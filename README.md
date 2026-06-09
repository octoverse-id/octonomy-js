# Octonomy TypeScript SDK

[![CI](https://github.com/octoverse-id/octonomy-js/actions/workflows/ci.yml/badge.svg)](https://github.com/octoverse-id/octonomy-js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@octoverse-id/octonomy.svg)](https://www.npmjs.com/package/@octoverse-id/octonomy)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

The official TypeScript client for [Octonomy](https://github.com/octoverse-id/octonomy) — a
multi-tenant, multi-application tag management and taxonomy service. A hand-written, axios-based client
for the stable REST **v1** API, shipped as dual ESM + CJS with full type declarations.

> **Status:** `0.1.0` — early. The transport, auth, error, and pagination foundation plus the
> **Vocabularies** and **Tags** resources are implemented. The remaining resources are tracked in
> [`docs/roadmap.md`](docs/roadmap.md).

## Install

```bash
npm install @octoverse-id/octonomy
```

Requires Node 18+ (or any runtime with `axios`). Works in both ESM (`import`) and CommonJS (`require`).

## Quickstart

```ts
import { Octonomy, ConflictError } from "@octoverse-id/octonomy";

const client = new Octonomy({
  baseUrl: "https://octonomy.example.com", // SDK appends /api/v1
  token: "svc_live_...",                   // Authorization: Bearer
  tenantId: "acme",                        // X-Tenant-ID
});

try {
  const tag = await client.tags.create({ name: "Featured", slug: "featured", type: "label" });
  console.log("created tag", tag.id);
} catch (error) {
  if (error instanceof ConflictError) {
    console.log("a tag with this (type, slug) already exists");
  } else {
    throw error;
  }
}
```

A complete, runnable program lives in [`examples/quickstart.ts`](examples/quickstart.ts).

## Authentication and tenant scope

Every request carries credentials from the constructor config:

| Header | Source | Purpose |
| ------ | ------ | ------- |
| `Authorization: Bearer <token>` | `token` | Service token (scopes: `tags:read`, `tags:write`, `audit:read`) |
| `X-Tenant-ID` | `tenantId` | Scopes every request to one tenant |
| `X-Actor-ID` *(optional)* | `actorId` or per-call `{ actorId }` | Attributes mutations in the audit log |

```ts
await client.tags.update(id, { isActive: false }, { actorId: "svc-catalog" });
```

You can also pass `timeout`, `userAgent`, or a custom axios `adapter` (for proxies/retries/tests).

## Errors

Non-2xx responses reject with a typed subclass of `ApiError`, exposing `statusCode`, `code`, `details`,
and `requestId`:

```ts
import { NotFoundError, ValidationError } from "@octoverse-id/octonomy";

try {
  await client.tags.get(id);
} catch (error) {
  if (error instanceof NotFoundError) {
    // 404
  } else if (error instanceof ValidationError) {
    console.log(error.details);
  }
}
```

## Pagination

List methods resolve to a `Page<T>` with `data` (an array of models) and `pagination`
(limit, offset, count, next, previous):

```ts
const page = await client.tags.list({ type: "label", limit: 50 });
console.log(page.data.length, "of", page.pagination.count);
```

## Implemented resources

| Resource | Status |
| -------- | ------ |
| Vocabularies (`client.vocabularies`) | ✅ create / get / list / update / delete |
| Tags (`client.tags`) | ✅ create / get / list / update / delete |
| Tag aliases, resolution, assignments (+bulk), resource tags, audit logs, health | 🚧 see [`docs/roadmap.md`](docs/roadmap.md) |

## Common commands

```bash
npm test            # vitest
npm run check       # biome + tsc + vitest
npm run build       # tsup -> dual ESM + CJS + .d.ts
make help           # list all targets
```

## Documentation

- [Architecture](docs/architecture.md) — how the client is layered.
- [API mapping](docs/api.md) — SDK methods ↔ Octonomy endpoints, auth, scopes.
- [Development](docs/development.md) — setup, quality gates, testing.
- [Versioning](docs/versioning.md) — SemVer policy and which server contract this SDK targets.
- [Release](docs/release.md) — the release + npm publish runbook.
- [Roadmap](docs/roadmap.md) — the backlog of remaining resources.
- [CHANGELOG](CHANGELOG.md)

## Contributing & security

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and
[SECURITY.md](SECURITY.md). The repository follows
[Conventional Branch](https://conventional-branch.github.io/) naming and Semantic Versioning.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
