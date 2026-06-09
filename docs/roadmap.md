# Roadmap

The foundation (transport, auth, errors, pagination) and the **Vocabularies** and **Tags** resources
are implemented. The resources below are queued for future work. Each is a self-contained unit that
follows the established pattern.

## How to add a resource (the recipe)

Copy `src/resources/tags.ts` (+ `test/tags.test.ts`) as the template, then:

1. Read the matching schema(s) in [`openapi.yaml`](openapi.yaml).
2. Add the model interface, `*Params` input types, the `fromApi`/`*ToApi`/`listToQuery` mappers
   (camelCase ↔ snake_case; omit `undefined`), and the `*Service` class delegating to `Transport`.
3. Wire a property onto `Octonomy` (`src/client.ts`) and re-export the new types/class from
   `src/index.ts`.
4. Add `makeClient`-based Vitest tests (assert method/path/headers/query/body; cover the error
   envelope), a `## [Unreleased]` CHANGELOG entry, and update [`api.md`](api.md).

Each item below is a good single GitHub issue (`feature/<n>-<slug>`).

## Tag aliases

Alternate identifiers that resolve to a canonical tag. Schemas: `TagAlias`, `TagAliasWrite`,
`PatchedTagAliasPatch`.

- `client.aliases.create()` → POST `/tag-aliases`
- `client.aliases.get()` → GET `/tag-aliases/{alias_id}`
- `client.aliases.list()` → GET `/tag-aliases`
- `client.aliases.update()` → PATCH `/tag-aliases/{alias_id}`
- `client.aliases.delete()` → DELETE `/tag-aliases/{alias_id}`
- `client.tags.listAliases()` → GET `/tags/{tag_id}/aliases`

## Tag resolution

Resolve a slug (optionally within an application) to a tag, possibly via an alias. Schema:
`TagResolution`.

- `client.tags.resolve(slug, ...)` → GET `/tag-resolution?slug={slug}&application_id={app}` returning
  `{ matchedType, matchedAlias, tag }`.

## Tag assignments

Link tags to external resources; idempotent writes (re-assigning returns 200, not 201). Schemas:
`Assignment`, `AssignmentWrite`, `BulkAssign`, `BulkRemove`.

- `client.assignments.create()` → POST `/tag-assignments`
- `client.assignments.remove()` → DELETE `/tag-assignments`
- `client.assignments.bulkAssign()` → POST `/tag-assignments/bulk-assign`
- `client.assignments.bulkRemove()` → POST `/tag-assignments/bulk-remove`

Note: assignment writes accept `tagId`, `aliasId`, or `aliasSlug`. Watch for the
`application_mismatch` and `inactive_tag` error codes (already on `ErrorCode`).

## Resource tags

Read or replace the full tag set on a resource. Schemas: `ResourceTag`, `ResourceReplace`,
`TagResource`.

- `client.resources.listTags(type, id)` → GET `/resources/{resource_type}/{resource_id}/tags`
- `client.resources.replaceTags(type, id, ...)` → POST `/resources/{resource_type}/{resource_id}/tags`
- `client.tags.listResources()` → GET `/tags/{tag_id}/resources`

## Audit logs

Append-only mutation history (needs the `audit:read` scope). Schema: `AuditLog`.

- `client.auditLogs.list()` → GET `/audit-logs` (with filters)
- `client.tags.listAuditLogs()` → GET `/tags/{tag_id}/audit-logs`
- `client.resources.listAuditLogs(type, id)` → GET `/resources/{resource_type}/{resource_id}/audit-logs`

## Health

Unauthenticated liveness/readiness probes. These live **outside** `/api/v1`, so they need a small
transport variant (or a dedicated method) that skips the prefix and auth headers.

- `client.health.live()` → GET `/health/live`
- `client.health.ready()` → GET `/health/ready`
