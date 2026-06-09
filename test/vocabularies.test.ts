import { describe, expect, it } from "vitest";
import { fullUrl, header, jsonBody, makeClient, method, query } from "./helpers";

describe("VocabularyService", () => {
  it("creates a vocabulary", async () => {
    const server = makeClient([
      { status: 201, data: { id: "voc_1", name: "Labels", slug: "labels", is_active: true } },
    ]);

    const vocab = await server.client.vocabularies.create({ name: "Labels", slug: "labels" });

    const request = server.requests[0]!;
    expect(method(request)).toBe("POST");
    expect(fullUrl(request)).toBe("https://octonomy.test/api/v1/vocabularies");
    expect(header(request, "Content-Type")).toBe("application/json");
    expect(jsonBody(request)).toEqual({ name: "Labels", slug: "labels" });

    expect(vocab.id).toBe("voc_1");
    expect(vocab.isActive).toBe(true);
  });

  it("gets a vocabulary by id", async () => {
    const server = makeClient([{ status: 200, data: { id: "voc_1", name: "Labels" } }]);
    const vocab = await server.client.vocabularies.get("voc_1");
    expect(fullUrl(server.requests[0]!)).toBe("https://octonomy.test/api/v1/vocabularies/voc_1");
    expect(vocab.id).toBe("voc_1");
  });

  it("lists vocabularies and decodes the envelope + camelCase", async () => {
    const server = makeClient([
      {
        status: 200,
        data: {
          data: [
            { id: "voc_1", tenant_id: "tenant-1", application_id: null, is_active: true },
            { id: "voc_2", tenant_id: "tenant-1" },
          ],
          pagination: { limit: 10, offset: 20, count: 2, next: null, previous: null },
        },
      },
    ]);

    const page = await server.client.vocabularies.list({
      includeShared: true,
      limit: 10,
      offset: 20,
    });

    expect(query(server.requests[0]!)).toEqual({
      include_shared: "true",
      limit: "10",
      offset: "20",
    });
    expect(page.data).toHaveLength(2);
    expect(page.data[0]!.tenantId).toBe("tenant-1");
    expect(page.data[0]!.applicationId).toBeNull();
    expect(page.pagination.count).toBe(2);
    expect(page.pagination.next).toBeNull();
  });

  it("updates a vocabulary, omitting unset fields", async () => {
    const server = makeClient([{ status: 200, data: { id: "voc_1", name: "Renamed" } }]);

    const vocab = await server.client.vocabularies.update("voc_1", { name: "Renamed" });

    const request = server.requests[0]!;
    expect(method(request)).toBe("PATCH");
    expect(fullUrl(request)).toBe("https://octonomy.test/api/v1/vocabularies/voc_1");
    expect(jsonBody(request)).toEqual({ name: "Renamed" });
    expect(vocab.name).toBe("Renamed");
  });

  it("deletes a vocabulary", async () => {
    const server = makeClient([{ status: 204, data: "" }]);
    await server.client.vocabularies.delete("voc_1");
    const request = server.requests[0]!;
    expect(method(request)).toBe("DELETE");
    expect(fullUrl(request)).toBe("https://octonomy.test/api/v1/vocabularies/voc_1");
  });
});
