import { boolOr, nullableRecord, nullableString, parseDate, stringOr } from "../internal";
import { type ListOptions, type Page, parsePage } from "../pagination";
import type { RequestOptions, Transport } from "../transport";

/**
 * A tenant-scoped grouping for tags. A vocabulary with a null `applicationId` is
 * shared across all applications in the tenant; otherwise it is scoped to one.
 */
export interface Vocabulary {
  id: string;
  tenantId: string;
  applicationId: string | null;
  name: string;
  slug: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Body for creating a vocabulary. `name` and `slug` are required. */
export interface VocabularyCreateParams {
  name: string;
  slug: string;
  applicationId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive?: boolean;
}

/** Body for updating a vocabulary. Only provided fields are sent. */
export interface VocabularyUpdateParams {
  name?: string;
  slug?: string;
  applicationId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive?: boolean;
}

/** Filters and paging for the vocabulary list. */
export interface VocabularyListParams extends ListOptions {
  applicationId?: string;
  includeShared?: boolean;
  isActive?: boolean;
}

function fromApi(raw: Record<string, unknown>): Vocabulary {
  return {
    id: stringOr(raw.id),
    tenantId: stringOr(raw.tenant_id),
    applicationId: nullableString(raw.application_id),
    name: stringOr(raw.name),
    slug: stringOr(raw.slug),
    description: nullableString(raw.description),
    metadata: nullableRecord(raw.metadata),
    isActive: boolOr(raw.is_active),
    createdAt: parseDate(raw.created_at),
    updatedAt: parseDate(raw.updated_at),
  };
}

function createToApi(params: VocabularyCreateParams): Record<string, unknown> {
  const body: Record<string, unknown> = { name: params.name, slug: params.slug };
  if (params.applicationId !== undefined) body.application_id = params.applicationId;
  if (params.description !== undefined) body.description = params.description;
  if (params.metadata !== undefined) body.metadata = params.metadata;
  if (params.isActive !== undefined) body.is_active = params.isActive;
  return body;
}

function updateToApi(params: VocabularyUpdateParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.slug !== undefined) body.slug = params.slug;
  if (params.applicationId !== undefined) body.application_id = params.applicationId;
  if (params.description !== undefined) body.description = params.description;
  if (params.metadata !== undefined) body.metadata = params.metadata;
  if (params.isActive !== undefined) body.is_active = params.isActive;
  return body;
}

function listToQuery(params?: VocabularyListParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (!params) return query;
  if (params.applicationId !== undefined) query.application_id = params.applicationId;
  if (params.includeShared !== undefined) query.include_shared = String(params.includeShared);
  if (params.isActive !== undefined) query.is_active = String(params.isActive);
  if (params.limit !== undefined) query.limit = String(params.limit);
  if (params.offset !== undefined) query.offset = String(params.offset);
  return query;
}

/** Accesses the /vocabularies endpoints. Reach it via `client.vocabularies`. */
export class VocabularyService {
  constructor(private readonly transport: Transport) {}

  /** Create a vocabulary (POST /vocabularies). */
  async create(params: VocabularyCreateParams, options?: RequestOptions): Promise<Vocabulary> {
    const body = await this.transport.request({
      method: "POST",
      path: "vocabularies",
      body: createToApi(params),
      options,
    });
    return fromApi(body);
  }

  /** Retrieve a vocabulary by id (GET /vocabularies/{id}). */
  async get(id: string, options?: RequestOptions): Promise<Vocabulary> {
    const body = await this.transport.request({
      method: "GET",
      path: `vocabularies/${encodeURIComponent(id)}`,
      options,
    });
    return fromApi(body);
  }

  /** List a page of vocabularies (GET /vocabularies). */
  async list(params?: VocabularyListParams, options?: RequestOptions): Promise<Page<Vocabulary>> {
    const body = await this.transport.request({
      method: "GET",
      path: "vocabularies",
      query: listToQuery(params),
      options,
    });
    return parsePage(body, fromApi);
  }

  /** Partially update a vocabulary (PATCH /vocabularies/{id}). */
  async update(
    id: string,
    params: VocabularyUpdateParams,
    options?: RequestOptions,
  ): Promise<Vocabulary> {
    const body = await this.transport.request({
      method: "PATCH",
      path: `vocabularies/${encodeURIComponent(id)}`,
      body: updateToApi(params),
      options,
    });
    return fromApi(body);
  }

  /**
   * Deactivate a vocabulary (DELETE /vocabularies/{id}). Octonomy treats
   * deletion as deactivation; the record and its history are retained.
   */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this.transport.request({
      method: "DELETE",
      path: `vocabularies/${encodeURIComponent(id)}`,
      options,
    });
  }
}
