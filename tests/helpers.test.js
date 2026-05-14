import test from "node:test";
import assert from "node:assert/strict";

import {
  createBom,
  decodeBomBinary,
  decodeBomJson,
  detectBomSpecVersion,
  encodeBomBinary,
  encodeBomJson,
  encodeBomJsonString,
  getBomSchema,
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
  assert.equal(json.specVersion, "1.6");

  const reparsed = parseBomJson(json);
  assert.equal(reparsed.$typeName, "cyclonedx.v1_6.Bom");
  assert.equal(reparsed.serialNumber, bom.serialNumber);

  const jsonString = encodeBomJsonString(bom);
  const reparsedFromString = parseBomJsonString(jsonString);
  assert.equal(reparsedFromString.$typeName, "cyclonedx.v1_6.Bom");
  assert.equal(reparsedFromString.version, 3);
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
