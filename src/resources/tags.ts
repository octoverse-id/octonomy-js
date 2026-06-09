import { boolOr, nullableRecord, nullableString, numberOr, parseDate, stringOr } from "../internal";
import { type ListOptions, type Page, parsePage } from "../pagination";
import type { RequestOptions, Transport } from "../transport";

/**
 * The core tagging unit. A tag with a null `applicationId` is shared across the
 * tenant; otherwise it is scoped to one application. `parentId` and
 * `vocabularyId` are set when nested or grouped. `usageCount` is read-only.
 */
export interface Tag {
  id: string;
  tenantId: string;
  applicationId: string | null;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  parentId: string | null;
  vocabularyId: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Body for creating a tag. `name`, `slug`, and `type` are required. */
export interface TagCreateParams {
  name: string;
  slug: string;
  type: string;
  applicationId?: string | null;
  description?: string | null;
  parentId?: string | null;
  vocabularyId?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive?: boolean;
}

/** Body for updating a tag. Only provided fields are sent. */
export interface TagUpdateParams {
  name?: string;
  slug?: string;
  type?: string;
  applicationId?: string | null;
  description?: string | null;
  parentId?: string | null;
  vocabularyId?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive?: boolean;
}

/** Filters and paging for the tag list. `query` maps to the server's `q`. */
export interface TagListParams extends ListOptions {
  applicationId?: string;
  includeShared?: boolean;
  isActive?: boolean;
  parentId?: string;
  query?: string;
  slug?: string;
  type?: string;
  vocabularyId?: string;
}

function fromApi(raw: Record<string, unknown>): Tag {
  return {
    id: stringOr(raw.id),
    tenantId: stringOr(raw.tenant_id),
    applicationId: nullableString(raw.application_id),
    name: stringOr(raw.name),
    slug: stringOr(raw.slug),
    type: stringOr(raw.type),
    description: nullableString(raw.description),
    parentId: nullableString(raw.parent_id),
    vocabularyId: nullableString(raw.vocabulary_id),
    metadata: nullableRecord(raw.metadata),
    isActive: boolOr(raw.is_active),
    usageCount: numberOr(raw.usage_count),
    createdAt: parseDate(raw.created_at),
    updatedAt: parseDate(raw.updated_at),
  };
}

function createToApi(params: TagCreateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: params.name,
    slug: params.slug,
    type: params.type,
  };
  if (params.applicationId !== undefined) body.application_id = params.applicationId;
  if (params.description !== undefined) body.description = params.description;
  if (params.parentId !== undefined) body.parent_id = params.parentId;
  if (params.vocabularyId !== undefined) body.vocabulary_id = params.vocabularyId;
  if (params.metadata !== undefined) body.metadata = params.metadata;
  if (params.isActive !== undefined) body.is_active = params.isActive;
  return body;
}

function updateToApi(params: TagUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.slug !== undefined) body.slug = params.slug;
  if (params.type !== undefined) body.type = params.type;
  if (params.applicationId !== undefined) body.application_id = params.applicationId;
  if (params.description !== undefined) body.description = params.description;
  if (params.parentId !== undefined) body.parent_id = params.parentId;
  if (params.vocabularyId !== undefined) body.vocabulary_id = params.vocabularyId;
  if (params.metadata !== undefined) body.metadata = params.metadata;
  if (params.isActive !== undefined) body.is_active = params.isActive;
  return body;
}

function listToQuery(params?: TagListParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (!params) return query;
  if (params.applicationId !== undefined) query.application_id = params.applicationId;
  if (params.includeShared !== undefined) query.include_shared = String(params.includeShared);
  if (params.isActive !== undefined) query.is_active = String(params.isActive);
  if (params.parentId !== undefined) query.parent_id = params.parentId;
  if (params.query !== undefined) query.q = params.query;
  if (params.slug !== undefined) query.slug = params.slug;
  if (params.type !== undefined) query.type = params.type;
  if (params.vocabularyId !== undefined) query.vocabulary_id = params.vocabularyId;
  if (params.limit !== undefined) query.limit = String(params.limit);
  if (params.offset !== undefined) query.offset = String(params.offset);
  return query;
}

/** Accesses the /tags endpoints. Reach it via `client.tags`. */
export class TagService {
  constructor(private readonly transport: Transport) {}

  /**
   * Create a tag (POST /tags). A duplicate (type, slug) for the tenant rejects
   * with a ConflictError.
   */
  async create(params: TagCreateParams, options?: RequestOptions): Promise<Tag> {
    const body = await this.transport.request({
      method: "POST",
      path: "tags",
      body: createToApi(params),
      options,
    });
    return fromApi(body);
  }

  /** Retrieve a tag by id (GET /tags/{id}). */
  async get(id: string, options?: RequestOptions): Promise<Tag> {
    const body = await this.transport.request({
      method: "GET",
      path: `tags/${encodeURIComponent(id)}`,
      options,
    });
    return fromApi(body);
  }

  /** List a page of tags (GET /tags). */
  async list(params?: TagListParams, options?: RequestOptions): Promise<Page<Tag>> {
    const body = await this.transport.request({
      method: "GET",
      path: "tags",
      query: listToQuery(params),
      options,
    });
    return parsePage(body, fromApi);
  }

  /** Partially update a tag (PATCH /tags/{id}). */
  async update(id: string, params: TagUpdateParams, options?: RequestOptions): Promise<Tag> {
    const body = await this.transport.request({
      method: "PATCH",
      path: `tags/${encodeURIComponent(id)}`,
      body: updateToApi(params),
      options,
    });
    return fromApi(body);
  }

  /**
   * Deactivate a tag (DELETE /tags/{id}). Octonomy treats deletion as
   * deactivation, which cascades to the tag's aliases.
   */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this.transport.request({
      method: "DELETE",
      path: `tags/${encodeURIComponent(id)}`,
      options,
    });
  }
}
