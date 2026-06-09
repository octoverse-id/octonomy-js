import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../src";
import { fullUrl, jsonBody, makeClient, method, query } from "./helpers";

describe("TagService", () => {
  it("creates a tag and maps timestamps to Date", async () => {
    const server = makeClient([
      {
        status: 201,
        data: {
          id: "tag_1",
          name: "Featured",
          slug: "featured",
          type: "label",
          is_active: true,
          usage_count: 0,
          created_at: "2026-06-08T12:00:00Z",
          updated_at: "2026-06-08T12:00:00Z",
        },
      },
    ]);

    const tag = await server.client.tags.create({
      name: "Featured",
      slug: "featured",
      type: "label",
    });

    const request = server.requests[0]!;
    expect(method(request)).toBe("POST");
    expect(fullUrl(request)).toBe("https://octonomy.test/api/v1/tags");
    expect(jsonBody(request)).toEqual({ name: "Featured", slug: "featured", type: "label" });

    expect(tag.id).toBe("tag_1");
    expect(tag.usageCount).toBe(0);
    expect(tag.createdAt).toBeInstanceOf(Date);
    expect(tag.createdAt.toISOString()).toBe("2026-06-08T12:00:00.000Z");
  });

  it("rejects a duplicate with ConflictError", async () => {
    const server = makeClient([
      { status: 409, data: { error: { code: "conflict", message: "duplicate slug" } } },
    ]);

    await expect(
      server.client.tags.create({ name: "Featured", slug: "featured", type: "label" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("sends every list parameter", async () => {
    const server = makeClient([
      {
        status: 200,
        data: { data: [{ id: "tag_1" }], pagination: { limit: 25, offset: 50, count: 1 } },
      },
    ]);

    const page = await server.client.tags.list({
      applicationId: "commerce",
      includeShared: true,
      isActive: false,
      parentId: "tag_parent",
      query: "promo",
      slug: "sale",
      type: "label",
      vocabularyId: "voc_1",
      limit: 25,
      offset: 50,
    });

    expect(query(server.requests[0]!)).toEqual({
      application_id: "commerce",
      include_shared: "true",
      is_active: "false",
      parent_id: "tag_parent",
      q: "promo",
      slug: "sale",
      type: "label",
      vocabulary_id: "voc_1",
      limit: "25",
      offset: "50",
    });
    expect(page.data).toHaveLength(1);
    expect(page.pagination.count).toBe(1);
  });

  it("lists without params", async () => {
    const server = makeClient([
      { status: 200, data: { data: [], pagination: { limit: 50, offset: 0, count: 0 } } },
    ]);
    const page = await server.client.tags.list();
    expect(query(server.requests[0]!)).toEqual({});
    expect(page.data).toHaveLength(0);
  });

  it("rejects a missing tag with NotFoundError", async () => {
    const server = makeClient([
      { status: 404, data: { error: { code: "not_found", message: "Resource not found." } } },
    ]);
    await expect(server.client.tags.get("missing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("updates a tag", async () => {
    const server = makeClient([{ status: 200, data: { id: "tag_1", is_active: false } }]);

    const tag = await server.client.tags.update("tag_1", { isActive: false });

    const request = server.requests[0]!;
    expect(method(request)).toBe("PATCH");
    expect(fullUrl(request)).toBe("https://octonomy.test/api/v1/tags/tag_1");
    expect(jsonBody(request)).toEqual({ is_active: false });
    expect(tag.isActive).toBe(false);
  });

  it("deletes a tag", async () => {
    const server = makeClient([{ status: 204, data: "" }]);
    await server.client.tags.delete("tag_1");
    const request = server.requests[0]!;
    expect(method(request)).toBe("DELETE");
    expect(fullUrl(request)).toBe("https://octonomy.test/api/v1/tags/tag_1");
  });
});
