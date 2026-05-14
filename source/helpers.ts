import {
  create,
  fromBinary,
  fromJson,
  toBinary,
  toJson,
  toJsonString,
} from "@bufbuild/protobuf";
import type {
  BinaryReadOptions,
  BinaryWriteOptions,
  JsonReadOptions,
  JsonValue,
  JsonWriteOptions,
  JsonWriteStringOptions,
  MessageInitShape,
  MessageJsonType,
} from "@bufbuild/protobuf";
import type { Bom as Bom15 } from "./lib/bom-1.5_pb.js";
import { BomSchema as BomSchema15 } from "./lib/bom-1.5_pb.js";
import type { Bom as Bom16 } from "./lib/bom-1.6_pb.js";
import { BomSchema as BomSchema16 } from "./lib/bom-1.6_pb.js";
import type { Bom as Bom17 } from "./lib/bom-1.7_pb.js";
import { BomSchema as BomSchema17 } from "./lib/bom-1.7_pb.js";

export const supportedSpecVersions = ["1.5", "1.6", "1.7"] as const;

export type SupportedSpecVersion = (typeof supportedSpecVersions)[number];

export type BomSchemaByVersion = {
  "1.5": typeof BomSchema15;
  "1.6": typeof BomSchema16;
  "1.7": typeof BomSchema17;
};

export type BomByVersion = {
  "1.5": Bom15;
  "1.6": Bom16;
  "1.7": Bom17;
};

export type BomInitByVersion = {
  [Version in SupportedSpecVersion]: MessageInitShape<BomSchemaByVersion[Version]>;
};

export type BomJsonByVersion = {
  [Version in SupportedSpecVersion]: MessageJsonType<BomSchemaByVersion[Version]>;
};

export type AnyBomSchema = BomSchemaByVersion[SupportedSpecVersion];
export type AnyBom = BomByVersion[SupportedSpecVersion];
export type AnyBomJson = BomJsonByVersion[SupportedSpecVersion];

const bomSchemas: BomSchemaByVersion = {
  "1.5": BomSchema15,
  "1.6": BomSchema16,
  "1.7": BomSchema17,
};

type BomVersionCarrier = {
  specVersion?: unknown;
  spec_version?: unknown;
};

function normalizeSpecVersion(specVersion: string | number): SupportedSpecVersion {
  const normalized = String(specVersion).trim().toLowerCase().replace(/^v/, "");
  const match = /^(1\.[567])(?:\.0+)?$/.exec(normalized);
  if (match) {
    return match[1] as SupportedSpecVersion;
  }

  throw new Error(
    `Unsupported CycloneDX spec version: ${String(specVersion)}. Supported versions: ${supportedSpecVersions.join(", ")}`,
  );
}

function readSpecVersion(value: BomVersionCarrier): SupportedSpecVersion {
  const candidate = value.specVersion ?? value.spec_version;
  if (typeof candidate !== "string" && typeof candidate !== "number") {
    throw new Error(
      "Unable to determine CycloneDX spec version. Expected a 'specVersion' or 'spec_version' field.",
    );
  }

  return normalizeSpecVersion(candidate);
}

function assertMatchingSpecVersion(
  expected: SupportedSpecVersion,
  value: BomVersionCarrier,
): void {
  const actual = readSpecVersion(value);
  if (actual !== expected) {
    throw new Error(
      `CycloneDX spec version mismatch: expected ${expected}, received ${actual}.`,
    );
  }
}

export function getBomSchema(specVersion: "1.5"): typeof BomSchema15;
export function getBomSchema(specVersion: "1.6"): typeof BomSchema16;
export function getBomSchema(specVersion: "1.7"): typeof BomSchema17;
export function getBomSchema(specVersion: string | number): AnyBomSchema;
export function getBomSchema(specVersion: string | number): AnyBomSchema {
  return bomSchemas[normalizeSpecVersion(specVersion)];
}

export function detectBomSpecVersion(value: BomVersionCarrier): SupportedSpecVersion {
  return readSpecVersion(value);
}

export function getBomSchemaForBom(bom: AnyBom): AnyBomSchema {
  return getBomSchema(detectBomSpecVersion(bom));
}

export function createBom(
  specVersion: "1.5",
  init?: BomInitByVersion["1.5"],
): BomByVersion["1.5"];
export function createBom(
  specVersion: "1.6",
  init?: BomInitByVersion["1.6"],
): BomByVersion["1.6"];
export function createBom(
  specVersion: "1.7",
  init?: BomInitByVersion["1.7"],
): BomByVersion["1.7"];
export function createBom(
  specVersion: string | number,
  init?: BomInitByVersion[SupportedSpecVersion],
): AnyBom;
export function createBom(
  specVersion: string | number,
  init?: BomInitByVersion[SupportedSpecVersion],
): AnyBom {
  const normalized = normalizeSpecVersion(specVersion);
  return create(getBomSchema(normalized), {
    ...init,
    specVersion: normalized,
  });
}

export function decodeBomBinary(
  specVersion: "1.5",
  bytes: Uint8Array,
  options?: Partial<BinaryReadOptions>,
): BomByVersion["1.5"];
export function decodeBomBinary(
  specVersion: "1.6",
  bytes: Uint8Array,
  options?: Partial<BinaryReadOptions>,
): BomByVersion["1.6"];
export function decodeBomBinary(
  specVersion: "1.7",
  bytes: Uint8Array,
  options?: Partial<BinaryReadOptions>,
): BomByVersion["1.7"];
export function decodeBomBinary(
  specVersion: string | number,
  bytes: Uint8Array,
  options?: Partial<BinaryReadOptions>,
): AnyBom;
export function decodeBomBinary(
  specVersion: string | number,
  bytes: Uint8Array,
  options?: Partial<BinaryReadOptions>,
): AnyBom {
  const normalized = normalizeSpecVersion(specVersion);
  const bom = fromBinary(getBomSchema(normalized), bytes, options);
  assertMatchingSpecVersion(normalized, bom);
  return bom;
}

export function decodeBomJson(
  specVersion: "1.5",
  json: JsonValue,
  options?: Partial<JsonReadOptions>,
): BomByVersion["1.5"];
export function decodeBomJson(
  specVersion: "1.6",
  json: JsonValue,
  options?: Partial<JsonReadOptions>,
): BomByVersion["1.6"];
export function decodeBomJson(
  specVersion: "1.7",
  json: JsonValue,
  options?: Partial<JsonReadOptions>,
): BomByVersion["1.7"];
export function decodeBomJson(
  specVersion: string | number,
  json: JsonValue,
  options?: Partial<JsonReadOptions>,
): AnyBom;
export function decodeBomJson(
  specVersion: string | number,
  json: JsonValue,
  options?: Partial<JsonReadOptions>,
): AnyBom {
  const normalized = normalizeSpecVersion(specVersion);
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const versionCarrier = json as BomVersionCarrier;
    if (versionCarrier.specVersion !== undefined || versionCarrier.spec_version !== undefined) {
      assertMatchingSpecVersion(normalized, versionCarrier);
    }
  }

  return fromJson(getBomSchema(normalized), json, options);
}

export function decodeBomJsonString(
  specVersion: "1.5",
  json: string,
  options?: Partial<JsonReadOptions>,
): BomByVersion["1.5"];
export function decodeBomJsonString(
  specVersion: "1.6",
  json: string,
  options?: Partial<JsonReadOptions>,
): BomByVersion["1.6"];
export function decodeBomJsonString(
  specVersion: "1.7",
  json: string,
  options?: Partial<JsonReadOptions>,
): BomByVersion["1.7"];
export function decodeBomJsonString(
  specVersion: string | number,
  json: string,
  options?: Partial<JsonReadOptions>,
): AnyBom;
export function decodeBomJsonString(
  specVersion: string | number,
  json: string,
  options?: Partial<JsonReadOptions>,
): AnyBom {
  return decodeBomJson(
    specVersion,
    JSON.parse(json) as JsonValue,
    options,
  );
}

export function parseBomJson(
  json: JsonValue,
  options?: Partial<JsonReadOptions>,
): AnyBom {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    throw new Error("CycloneDX BOM JSON must be an object.");
  }

  return decodeBomJson(detectBomSpecVersion(json as BomVersionCarrier), json, options);
}

export function parseBomJsonString(
  json: string,
  options?: Partial<JsonReadOptions>,
): AnyBom {
  const parsed = JSON.parse(json) as JsonValue;
  return parseBomJson(parsed, options);
}

export function encodeBomBinary(
  bom: AnyBom,
  options?: Partial<BinaryWriteOptions>,
): Uint8Array {
  return toBinary(getBomSchemaForBom(bom), bom, options);
}

export function encodeBomJson(
  bom: BomByVersion["1.5"],
  options?: Partial<JsonWriteOptions>,
): BomJsonByVersion["1.5"];
export function encodeBomJson(
  bom: BomByVersion["1.6"],
  options?: Partial<JsonWriteOptions>,
): BomJsonByVersion["1.6"];
export function encodeBomJson(
  bom: BomByVersion["1.7"],
  options?: Partial<JsonWriteOptions>,
): BomJsonByVersion["1.7"];
export function encodeBomJson(
  bom: AnyBom,
  options?: Partial<JsonWriteOptions>,
): AnyBomJson;
export function encodeBomJson(
  bom: AnyBom,
  options?: Partial<JsonWriteOptions>,
): AnyBomJson {
  const schema = getBomSchemaForBom(bom);
  return toJson(schema, bom, options) as AnyBomJson;
}

export function encodeBomJsonString(
  bom: AnyBom,
  options?: Partial<JsonWriteStringOptions>,
): string {
  return toJsonString(getBomSchemaForBom(bom), bom, options);
}
