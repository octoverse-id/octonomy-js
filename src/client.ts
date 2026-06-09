import type { AxiosAdapter } from "axios";
import { OctonomyConfigError } from "./errors";
import { TagService } from "./resources/tags";
import { VocabularyService } from "./resources/vocabularies";
import { Transport } from "./transport";

/** Configuration for the Octonomy client. */
export interface OctonomyConfig {
  /** Octonomy origin, e.g. "https://octonomy.example.com". The SDK appends /api/v1. */
  baseUrl: string;
  /** Service token sent as `Authorization: Bearer <token>`. */
  token: string;
  /** Tenant id sent as `X-Tenant-ID`; scopes every request. */
  tenantId: string;
  /** Default actor id sent as `X-Actor-ID` (overridable per call). */
  actorId?: string;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Overrides the default `octonomy-js/<version>` User-Agent. */
  userAgent?: string;
  /** Custom axios adapter (for tests, proxies, or alternative transports). */
  adapter?: AxiosAdapter;
}

/**
 * The entry point to the Octonomy API.
 *
 * ```ts
 * const client = new Octonomy({ baseUrl, token, tenantId });
 * const tag = await client.tags.create({ name: "Featured", slug: "featured", type: "label" });
 * ```
 */
export class Octonomy {
  /** Manages tenant-scoped tag groupings. */
  readonly vocabularies: VocabularyService;
  /** Manages the core tagging units. */
  readonly tags: TagService;

  constructor(config: OctonomyConfig) {
    validateConfig(config);
    const transport = new Transport({
      baseUrl: config.baseUrl,
      token: config.token,
      tenantId: config.tenantId,
      actorId: config.actorId,
      timeout: config.timeout,
      userAgent: config.userAgent,
      adapter: config.adapter,
    });
    this.vocabularies = new VocabularyService(transport);
    this.tags = new TagService(transport);
  }
}

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}

function validateConfig(config: OctonomyConfig): void {
  if (typeof config !== "object" || config === null) {
    throw new OctonomyConfigError("octonomy: a config object is required");
  }
  if (isBlank(config.baseUrl)) {
    throw new OctonomyConfigError("octonomy: baseUrl is required");
  }
  if (isBlank(config.token)) {
    throw new OctonomyConfigError("octonomy: token is required");
  }
  if (isBlank(config.tenantId)) {
    throw new OctonomyConfigError("octonomy: tenantId is required");
  }
  let parsed: URL;
  try {
    parsed = new URL(config.baseUrl);
  } catch {
    throw new OctonomyConfigError(
      `octonomy: baseUrl must be an absolute URL, got "${config.baseUrl}"`,
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new OctonomyConfigError(
      `octonomy: baseUrl must be an http(s) URL, got "${config.baseUrl}"`,
    );
  }
}
