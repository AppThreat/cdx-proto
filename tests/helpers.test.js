import assert from "node:assert/strict";
import test from "node:test";

import {
  createBom,
  decodeBomBinary,
  decodeBomJson,
  detectBomSpecVersion,
  encodeBomBinary,
  encodeBomJson,
  encodeBomJsonString,
  getBomSchema,
  parseBomBinary,
  parseBomJson,
  parseBomJsonString,
  supportedSpecVersions,
} from "../dist/index.js";
import * as v15 from "../dist/v1.5.js";
import * as v16 from "../dist/v1.6.js";
import * as v17 from "../dist/v1.7.js";

test("version-specific subpath exports expose the expected BomSchema", () => {
  assert.equal(v15.BomSchema.typeName, "cyclonedx.v1_5.Bom");
  assert.equal(v16.BomSchema.typeName, "cyclonedx.v1_6.Bom");
  assert.equal(v17.BomSchema.typeName, "cyclonedx.v1_7.Bom");
});

test("getBomSchema resolves supported versions", () => {
  assert.deepEqual(supportedSpecVersions, ["1.5", "1.6", "1.7"]);
  assert.equal(getBomSchema("v1.5").typeName, "cyclonedx.v1_5.Bom");
  assert.equal(getBomSchema(1.6).typeName, "cyclonedx.v1_6.Bom");
  assert.equal(getBomSchema("1.7.0").typeName, "cyclonedx.v1_7.Bom");
});

test("createBom populates specVersion and round-trips binary/json", () => {
  const bom = createBom("1.6", {
    version: 3,
    serialNumber: "urn:uuid:11111111-1111-1111-1111-111111111111",
  });

  assert.equal(bom.specVersion, "1.6");

  const binary = encodeBomBinary(bom);
  const decoded = decodeBomBinary("1.6", binary);
  assert.equal(decoded.specVersion, "1.6");
  assert.equal(decoded.version, 3);

  const json = encodeBomJson(bom);
  assert.equal(json.bomFormat, "CycloneDX");
  assert.equal(json.specVersion, "1.6");

  const reparsed = parseBomJson(json);
  assert.equal(reparsed.$typeName, "cyclonedx.v1_6.Bom");
  assert.equal(reparsed.serialNumber, bom.serialNumber);

  const jsonString = encodeBomJsonString(bom);
  const reparsedFromString = parseBomJsonString(jsonString);
  assert.equal(reparsedFromString.$typeName, "cyclonedx.v1_6.Bom");
  assert.equal(reparsedFromString.version, 3);
});

test("canonical CycloneDX JSON round-trips without protobuf enum leakage", () => {
  const bom = parseBomJson(
    {
      bomFormat: "CycloneDX",
      specVersion: "1.7",
      version: 1,
      metadata: {
        component: {
          type: "application",
          name: "demo-app",
          version: "1.0.0",
          hashes: [{ alg: "SHA-256", content: "abc123" }],
          externalReferences: [
            {
              type: "release-notes",
              url: "https://example.invalid/release-notes",
            },
          ],
          evidence: {
            identity: [
              {
                field: "purl",
                concludedValue: "pkg:npm/demo-app@1.0.0",
                methods: [
                  {
                    technique: "dynamic-analysis",
                    value: "scanner",
                    confidence: 0.9,
                  },
                ],
              },
            ],
          },
        },
        lifecycles: [{ phase: "design" }, { name: "custom" }],
      },
      components: [
        undefined,
        {
          type: "library",
          name: "dep",
          version: "2.0.0",
        },
      ],
    },
    { ignoreUnknownFields: true },
  );

  const json = encodeBomJson(bom);
  assert.equal(json.bomFormat, "CycloneDX");
  assert.equal(json.specVersion, "1.7");
  assert.equal(json.metadata.component.type, "application");
  assert.deepEqual(json.metadata.component.hashes, [
    { alg: "SHA-256", content: "abc123" },
  ]);
  assert.equal(
    json.metadata.component.externalReferences[0].type,
    "release-notes",
  );
  assert.equal(json.metadata.component.evidence.identity[0].field, "purl");
  assert.equal(
    json.metadata.component.evidence.identity[0].methods[0].technique,
    "dynamic-analysis",
  );
  assert.deepEqual(json.metadata.lifecycles, [
    { phase: "design" },
    { name: "custom" },
  ]);
  assert.equal(json.components.length, 1);
  assert.equal(json.components[0].type, "library");

  const jsonString = encodeBomJsonString(bom);
  assert.match(jsonString, /"bomFormat":"CycloneDX"/);
  assert.doesNotMatch(
    jsonString,
    /CLASSIFICATION_|HASH_ALG_|EXTERNAL_REFERENCE_TYPE_|LIFECYCLE_PHASE_|EVIDENCE_/,
  );
});

test("parse helpers detect camelCase and proto field names", () => {
  const bomFromCamelCase = parseBomJson({
    specVersion: "1.5",
    version: 1,
  });
  assert.equal(bomFromCamelCase.$typeName, "cyclonedx.v1_5.Bom");

  const bomFromProtoField = parseBomJson({
    spec_version: "1.7",
    version: 2,
  });
  assert.equal(bomFromProtoField.$typeName, "cyclonedx.v1_7.Bom");
  assert.equal(detectBomSpecVersion({ spec_version: "v1.7.0" }), "1.7");
});

test("decodeBomJson rejects an explicit version mismatch", () => {
  assert.throws(
    () =>
      decodeBomJson("1.6", {
        specVersion: "1.7",
        version: 1,
      }),
    /spec version mismatch/i,
  );
});

test("decodeBomJson accepts JSON without an embedded specVersion when the caller supplies one", () => {
  const bom = decodeBomJson("1.6", {
    version: 4,
    serialNumber: "urn:uuid:22222222-2222-2222-2222-222222222222",
  });

  assert.equal(bom.$typeName, "cyclonedx.v1_6.Bom");
  assert.equal(bom.version, 4);
  assert.equal(
    bom.serialNumber,
    "urn:uuid:22222222-2222-2222-2222-222222222222",
  );
});

test("parseBomBinary auto-detects the embedded CycloneDX spec version", () => {
  const bom = parseBomJson({
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    version: 1,
    metadata: {
      component: {
        type: "application",
        name: "binary-demo",
      },
    },
  });

  const decoded = parseBomBinary(encodeBomBinary(bom));
  assert.equal(decoded.$typeName, "cyclonedx.v1_6.Bom");
  assert.equal(decoded.specVersion, "1.6");

  const json = encodeBomJson(decoded);
  assert.equal(json.bomFormat, "CycloneDX");
  assert.equal(json.metadata.component.type, "application");
});
