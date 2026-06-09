/**
 * Quickstart for the Octonomy TypeScript SDK: configure a client, create a
 * vocabulary and a tag, list tags, and handle a typed error.
 *
 * Run it against a local Octonomy instance:
 *
 *   OCTONOMY_BASE_URL=http://localhost:8000 \
 *   OCTONOMY_TOKEN=svc_... \
 *   OCTONOMY_TENANT_ID=acme \
 *   npx tsx examples/quickstart.ts
 */

import { ConflictError, Octonomy, isApiError } from "../src";

function env(key: string, fallback: string): string {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
}

async function main(): Promise<void> {
  const client = new Octonomy({
    baseUrl: env("OCTONOMY_BASE_URL", "http://localhost:8000"),
    token: env("OCTONOMY_TOKEN", "svc_local_dev"),
    tenantId: env("OCTONOMY_TENANT_ID", "acme"),
    actorId: "quickstart-example",
  });

  const vocab = await client.vocabularies.create({ name: "Labels", slug: "labels" });
  console.log(`created vocabulary ${vocab.name} (${vocab.id})`);

  try {
    const tag = await client.tags.create({
      name: "Featured",
      slug: "featured",
      type: "label",
      vocabularyId: vocab.id,
      metadata: { source: "quickstart" },
    });
    console.log(`created tag ${tag.name} (${tag.id})`);
  } catch (error) {
    if (error instanceof ConflictError) {
      console.log("tag already exists; continuing");
    } else {
      throw error;
    }
  }

  const page = await client.tags.list({ type: "label", limit: 20 });
  console.log(`tenant has ${page.data.length} label tag(s) on this page`);
}

main().catch((error: unknown) => {
  const message = isApiError(error) ? error.message : String(error);
  console.error(`Octonomy error: ${message}`);
  process.exitCode = 1;
});
