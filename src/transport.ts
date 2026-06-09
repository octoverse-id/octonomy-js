import axios, { type AxiosAdapter, type AxiosInstance, type AxiosResponse } from "axios";
import { ApiError, OctonomyTransportError } from "./errors";
import { VERSION } from "./version";

/** Per-call request options. */
export interface RequestOptions {
  /** Overrides the configured actor id for one call (sent as X-Actor-ID). */
  actorId?: string;
  /** Aborts the request when the signal fires. */
  signal?: AbortSignal;
}

/** Configuration the Transport needs; built by the Client from OctonomyConfig. */
export interface TransportConfig {
  baseUrl: string;
  token: string;
  tenantId: string;
  actorId?: string;
  timeout?: number;
  userAgent?: string;
  adapter?: AxiosAdapter;
}

interface RequestArgs {
  method: string;
  path: string;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
  options?: RequestOptions;
}

/**
 * Transport is the single HTTP entry point. It builds requests under the
 * /api/v1 prefix, attaches the auth/tenant headers, sends them through axios,
 * and converts non-2xx responses into typed errors.
 *
 * @internal
 */
export class Transport {
  private readonly http: AxiosInstance;
  private readonly actorId: string | null;

  constructor(config: TransportConfig) {
    this.actorId = config.actorId ?? null;
    this.http = axios.create({
      baseURL: `${config.baseUrl.replace(/\/+$/, "")}/api/v1`,
      timeout: config.timeout,
      adapter: config.adapter,
      // The SDK owns status handling so it can map errors to typed exceptions.
      validateStatus: () => true,
      headers: {
        Authorization: `Bearer ${config.token}`,
        "X-Tenant-ID": config.tenantId,
        Accept: "application/json",
        "User-Agent": config.userAgent ?? `octonomy-js/${VERSION}`,
      },
    });
  }

  async request<T = Record<string, unknown>>(args: RequestArgs): Promise<T> {
    const headers: Record<string, string> = {};
    const actor = args.options?.actorId ?? this.actorId;
    if (actor) {
      headers["X-Actor-ID"] = actor;
    }

    let response: AxiosResponse<unknown>;
    try {
      response = await this.http.request({
        method: args.method,
        url: args.path,
        params: args.query,
        data: args.body,
        headers,
        signal: args.options?.signal,
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      throw new OctonomyTransportError(`octonomy: request failed: ${message}`, { cause });
    }

    if (response.status < 200 || response.status >= 300) {
      throw ApiError.fromResponse(response.status, response.data);
    }

    return response.data as T;
  }
}
