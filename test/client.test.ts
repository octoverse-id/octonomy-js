import { describe, expect, it } from "vitest";
import {
  type ApiError,
  type ApiErrorFields,
  AuthenticationError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  Octonomy,
  type OctonomyConfig,
  OctonomyConfigError,
  VERSION,
  ValidationError,
  isApiError,
} from "../src";
import { header, makeClient } from "./helpers";

describe("config validation", () => {
  const invalid: Array<[string, Partial<OctonomyConfig>]> = [
    ["missing baseUrl", { token: "t", tenantId: "acme" }],
    ["missing token", { baseUrl: "https://x.test", tenantId: "acme" }],
    ["missing tenantId", { baseUrl: "https://x.test", token: "t" }],
    ["relative baseUrl", { baseUrl: "x.test", token: "t", tenantId: "acme" }],
    ["non-http baseUrl", { baseUrl: "ftp://x.test", token: "t", tenantId: "acme" }],
  ];

  it.each(invalid)("throws for %s", (_label, config) => {
    expect(() => new Octonomy(config as OctonomyConfig)).toThrow(OctonomyConfigError);
  });

  it("builds with a valid config (trailing slash allowed)", () => {
    const client = new Octonomy({
      baseUrl: "https://octonomy.test/",
      token: "t",
      tenantId: "acme",
    });
    expect(client.tags).toBeDefined();
    expect(client.vocabularies).toBeDefined();
  });
});

describe("request headers", () => {
  it("sends auth, tenant, accept, and user-agent headers", async () => {
    const server = makeClient([{ status: 200, data: { id: "tag_1" } }]);
    await server.client.tags.get("tag_1");

    const request = server.requests[0];
    if (!request) throw new Error("no request");
    expect(`${request.baseURL}/${request.url}`).toBe("https://octonomy.test/api/v1/tags/tag_1");
    expect((request.method ?? "").toUpperCase()).toBe("GET");
    expect(header(request, "Authorization")).toBe("Bearer test-token");
    expect(header(request, "X-Tenant-ID")).toBe("tenant-1");
    expect(header(request, "Accept")).toBe("application/json");
    expect(header(request, "User-Agent")).toBe(`octonomy-js/${VERSION}`);
    expect(header(request, "X-Actor-ID")).toBe("");
  });

  it("sends the actor header from config", async () => {
    const server = makeClient([{ status: 200, data: { id: "tag_1" } }], { actorId: "svc-config" });
    await server.client.tags.get("tag_1");
    expect(header(server.requests[0]!, "X-Actor-ID")).toBe("svc-config");
  });

  it("lets a per-call actor override the config", async () => {
    const server = makeClient([{ status: 200, data: { id: "tag_1" } }], { actorId: "svc-config" });
    await server.client.tags.get("tag_1", { actorId: "svc-call" });
    expect(header(server.requests[0]!, "X-Actor-ID")).toBe("svc-call");
  });
});

describe("error mapping", () => {
  const cases: Array<[number, string, new (f: ApiErrorFields) => ApiError]> = [
    [404, "not_found", NotFoundError],
    [409, "conflict", ConflictError],
    [400, "validation_error", ValidationError],
    [400, "tenant_mismatch", ValidationError],
    [401, "authentication_required", AuthenticationError],
    [403, "forbidden", ForbiddenError],
  ];

  it.each(cases)("maps %i %s to the right class", async (status, code, ctor) => {
    const server = makeClient([
      {
        status,
        data: {
          error: { code, message: "boom", details: { field: "slug" }, request_id: "req_123" },
        },
      },
    ]);

    try {
      await server.client.tags.get("tag_1");
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ctor);
      expect(isApiError(error)).toBe(true);
      const apiError = error as ApiError;
      expect(apiError.statusCode).toBe(status);
      expect(apiError.code).toBe(code);
      expect(apiError.requestId).toBe("req_123");
      expect(apiError.details.field).toBe("slug");
      expect(apiError.message).toBe("boom");
    }
  });

  it("falls back for a non-envelope error body", async () => {
    const server = makeClient([{ status: 502, data: "upstream down" }]);
    try {
      await server.client.tags.get("tag_1");
      expect.unreachable("should have thrown");
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.statusCode).toBe(502);
      expect(apiError.code).toBe("http_502");
    }
  });
});
