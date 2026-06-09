import {
  type AxiosAdapter,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { Octonomy, type OctonomyConfig } from "../src";

export interface MockResponse {
  status: number;
  data: unknown;
}

export interface MockServer {
  client: Octonomy;
  requests: InternalAxiosRequestConfig[];
}

/** Build a client backed by a queue of canned responses via a mock axios adapter. */
export function makeClient(
  responses: MockResponse[],
  config: Partial<OctonomyConfig> = {},
): MockServer {
  const requests: InternalAxiosRequestConfig[] = [];
  let index = 0;

  const adapter: AxiosAdapter = async (request) => {
    requests.push(request);
    const next = responses[index++] ?? { status: 200, data: {} };
    const response: AxiosResponse = {
      data: next.data,
      status: next.status,
      statusText: "",
      headers: new AxiosHeaders(),
      config: request,
    };
    return response;
  };

  const client = new Octonomy({
    baseUrl: "https://octonomy.test",
    token: "test-token",
    tenantId: "tenant-1",
    adapter,
    ...config,
  });

  return { client, requests };
}

export function lastRequest(server: MockServer): InternalAxiosRequestConfig {
  const request = server.requests.at(-1);
  if (!request) {
    throw new Error("no request was captured");
  }
  return request;
}

export function fullUrl(request: InternalAxiosRequestConfig): string {
  return `${request.baseURL ?? ""}/${request.url ?? ""}`;
}

export function method(request: InternalAxiosRequestConfig): string {
  return (request.method ?? "").toUpperCase();
}

export function header(request: InternalAxiosRequestConfig, name: string): string {
  const value = request.headers.get(name);
  return value == null ? "" : String(value);
}

export function jsonBody(request: InternalAxiosRequestConfig): Record<string, unknown> {
  if (typeof request.data !== "string" || request.data === "") {
    return {};
  }
  return JSON.parse(request.data) as Record<string, unknown>;
}

export function query(request: InternalAxiosRequestConfig): Record<string, string> {
  return (request.params as Record<string, string> | undefined) ?? {};
}
