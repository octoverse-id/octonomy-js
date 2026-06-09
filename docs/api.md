# API mapping

How SDK methods map to Octonomy REST **v1** endpoints. The authoritative contract is the vendored
[`openapi.yaml`](openapi.yaml); this page is the client-side view.

## Base URL and headers

The client targets `baseUrl + /api/v1`. Every request carries:

| Header | Source | Required |
| ------ | ------ | -------- |
| `Authorization: Bearer <token>` | `token` | yes |
| `X-Tenant-ID` | `tenantId` | yes |
| `X-Actor-ID` | `actorId` or per-call `{ actorId }` | no |
| `Accept: application/json` | always | — |
| `Content-Type: application/json` | requests with a body | — |
| `User-Agent` | `userAgent` (default `octonomy-js/<version>`) | — |

## Scopes

Service tokens carry scopes enforced by the server: `tags:read`, `tags:write`, `audit:read`. Read
methods need `tags:read`; mutating methods need `tags:write`.

## Implemented

| SDK method | HTTP | Path |
| ---------- | ---- | ---- |
| `client.vocabularies.create()` | POST | `/vocabularies` |
| `client.vocabularies.get()` | GET | `/vocabularies/{id}` |
| `client.vocabularies.list()` | GET | `/vocabularies` |
| `client.vocabularies.update()` | PATCH | `/vocabularies/{id}` |
| `client.vocabularies.delete()` | DELETE | `/vocabularies/{id}` |
| `client.tags.create()` | POST | `/tags` |
| `client.tags.get()` | GET | `/tags/{id}` |
| `client.tags.list()` | GET | `/tags` |
| `client.tags.update()` | PATCH | `/tags/{id}` |
| `client.tags.delete()` | DELETE | `/tags/{id}` |

### List parameters (camelCase → wire)

`TagListParams` exposes the full server filter set: `applicationId`, `includeShared`, `isActive`,
`parentId`, `query` (→ `q`), `slug`, `type`, `vocabularyId`, plus `limit`/`offset`.
`VocabularyListParams` exposes `applicationId`, `includeShared`, `isActive`, and paging. Boolean params
serialize to `"true"`/`"false"`.

## Responses

- **Single resource:** the model object (e.g. `Tag`), camelCase, timestamps as `Date`.
- **List:** `Page<T>` = `{ data: T[]; pagination: { limit, offset, count, next, previous } }`.
- **Delete:** resolves to `void` (deactivation on the server).
- **Errors:** `{ error: { code, message, details, request_id } }` → a typed `ApiError` subclass.

## Error codes → classes

| Code | HTTP | Class |
| ---- | ---- | ----- |
| `validation_error`, `tenant_mismatch`, `application_mismatch`, `inactive_tag` | 400 | `ValidationError` |
| `authentication_required` | 401 | `AuthenticationError` |
| `forbidden` | 403 | `ForbiddenError` |
| `not_found` | 404 | `NotFoundError` |
| `conflict` | 409 | `ConflictError` |
| (other / no envelope) | any | `ApiError` |

Every error exposes `statusCode`, `code`, `details`, and `requestId`. The string codes are available
as `ErrorCode`.

## Not yet implemented

Tag aliases, tag resolution, tag assignments (incl. bulk), resource tags, audit logs, and health — see
[roadmap.md](roadmap.md).
