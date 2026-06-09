# Architecture

`octonomy-js` is a thin, hand-written client for the Octonomy REST **v1** API, built on axios and
published as dual ESM + CJS. The design goal is that an agent (or human) can add a new resource by
copying an existing service file and changing the types and mappers.

## Layers

| File | Responsibility |
| ---- | -------------- |
| `src/index.ts` | The public surface — re-exports the client, types, and error classes. |
| `src/client.ts` | `Octonomy` class + `OctonomyConfig`; validates config and wires services. |
| `src/transport.ts` | `Transport` + `RequestOptions`: the single `request()` that builds /api/v1 axios calls, sets headers, and maps status → error. |
| `src/errors.ts` | `OctonomyError` base; `ApiError` (+ `NotFound`/`Conflict`/`Validation`/`Authentication`/`Forbidden`); `OctonomyConfigError`, `OctonomyTransportError`; `isApiError`; `ErrorCode`. |
| `src/pagination.ts` | `Page<T>`, `Pagination`, `ListOptions`, `parsePage`. |
| `src/resources/*.ts` | One per resource: the model type, `*Params` input types, mappers, and the `*Service` class. |
| `src/internal.ts` | Defensive JSON readers (`stringOr`, `nullableString`, `parseDate`, …); `@internal`. |
| `src/version.ts` | The `VERSION` constant (User-Agent + version-check). |

## Request lifecycle

1. A service method (e.g. `client.tags.create`) maps camelCase params to the snake_case wire body and
   calls `transport.request({ method, path, query?, body?, options? })`.
2. `Transport` sends through an axios instance configured with `baseURL = baseUrl + "/api/v1"`, the
   auth/tenant headers, and `validateStatus: () => true` so the SDK owns status handling.
3. On a 2xx it returns the parsed body, which the service maps to a model / `Page` via `fromApi` +
   `parsePage`. On a non-2xx it throws `ApiError.fromResponse()` (the most specific subclass). axios
   network errors (no response) become `OctonomyTransportError`.

```
caller ─▶ service.method ─▶ Transport.request ─▶ axios ─▶ Octonomy /api/v1
                                  │
                                  ├─ 2xx → body → fromApi / parsePage
                                  └─ !2xx → throw ApiError subclass (statusCode, code, details, requestId)
```

## Conventions that keep it faithful

- **Contract reference:** `docs/openapi.yaml` is vendored from the server. Model fields mirror it. The
  one deliberate divergence is the list envelope: the generated spec shows a bare array, but the server
  wraps lists in `{data, pagination}` (see `octonomy/core/pagination.py` upstream). The SDK follows the
  server; the divergence is noted in code.
- **camelCase ↔ snake_case:** the public API is camelCase (idiomatic TS). Each resource owns its
  `fromApi` (wire → model), `createToApi`/`updateToApi` (params → wire, omitting `undefined`), and
  `listToQuery` (params → query, stringifying booleans). Timestamps parse to `Date`.
- **Typed errors:** callers branch with `instanceof` or `isApiError`; the SDK never returns error
  codes. `noUncheckedIndexedAccess` + `unknown`-first parsing keep hydration total.
- **No hidden behavior:** the client never retries or logs. Retries/proxies are supplied via a custom
  axios `adapter`.

## Multi-tenancy

Every request is scoped to one tenant via `X-Tenant-ID` (`tenantId`, required). Tags and vocabularies
may be shared (`applicationId === null`) or application-specific; assignments always carry an
`applicationId`. The SDK passes these through faithfully — the server enforces isolation.

## Extending the client

To add a resource, follow `src/resources/tags.ts`:

1. Read the matching schema(s) in `docs/openapi.yaml`.
2. Add the model interface, `*Params` types, mappers, and a `*Service` class.
3. Wire a property onto `Octonomy` and re-export from `src/index.ts`.
4. Add `makeClient`-based Vitest tests and a CHANGELOG entry.

See [roadmap.md](roadmap.md) for the queued resources.
