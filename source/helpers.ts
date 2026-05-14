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
import {
  create,
  fromBinary,
  fromJson,
  toBinary,
  toJson,
} from "@bufbuild/protobuf";

import type { Bom as Bom15 } from "./lib/bom-1.5_pb.js";
import { BomSchema as BomSchema15 } from "./lib/bom-1.5_pb.js";
import type { Bom as Bom16 } from "./lib/bom-1.6_pb.js";
import {
  BomSchema as BomSchema16,
  LifecyclePhase as LifecyclePhase16,
  LifecyclesSchema as LifecyclesSchema16,
} from "./lib/bom-1.6_pb.js";
import type { Bom as Bom17 } from "./lib/bom-1.7_pb.js";
import {
  BomSchema as BomSchema17,
  LifecyclePhase as LifecyclePhase17,
  LifecyclesSchema as LifecyclesSchema17,
} from "./lib/bom-1.7_pb.js";

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
  [Version in SupportedSpecVersion]: MessageInitShape<
    BomSchemaByVersion[Version]
  >;
};

export type BomJsonByVersion = {
  [Version in SupportedSpecVersion]: MessageJsonType<
    BomSchemaByVersion[Version]
  >;
};

export type AnyBomSchema = BomSchemaByVersion[SupportedSpecVersion];
export type AnyBom = BomByVersion[SupportedSpecVersion];
export type AnyBomJson = BomJsonByVersion[SupportedSpecVersion];

type JsonLike = unknown;
type JsonRecord = Record<string, unknown>;

const bomSchemas: BomSchemaByVersion = {
  "1.5": BomSchema15,
  "1.6": BomSchema16,
  "1.7": BomSchema17,
};

type BomVersionCarrier = {
  specVersion?: unknown;
  spec_version?: unknown;
};

const PREDEFINED_LIFECYCLE_PHASES = new Set([
  "design",
  "pre-build",
  "build",
  "post-build",
  "operations",
  "discovery",
  "decommission",
]);

const PREDEFINED_LIFECYCLE_PHASE_TO_ENUM_VALUE = {
  design: "DESIGN",
  "pre-build": "PRE_BUILD",
  build: "BUILD",
  "post-build": "POST_BUILD",
  operations: "OPERATIONS",
  discovery: "DISCOVERY",
  decommission: "DECOMMISSION",
} as const;

const LIFECYCLE_MESSAGE_BUILDERS = {
  "1.6": {
    phaseEnum: LifecyclePhase16,
    schema: LifecyclesSchema16,
  },
  "1.7": {
    phaseEnum: LifecyclePhase17,
    schema: LifecyclesSchema17,
  },
} as const;

const COMPONENT_TYPE_TO_ENUM_VALUE = {
  application: "CLASSIFICATION_APPLICATION",
  framework: "CLASSIFICATION_FRAMEWORK",
  library: "CLASSIFICATION_LIBRARY",
  container: "CLASSIFICATION_CONTAINER",
  platform: "CLASSIFICATION_PLATFORM",
  "operating-system": "CLASSIFICATION_OPERATING_SYSTEM",
  device: "CLASSIFICATION_DEVICE",
  "device-driver": "CLASSIFICATION_DEVICE_DRIVER",
  firmware: "CLASSIFICATION_FIRMWARE",
  file: "CLASSIFICATION_FILE",
  "machine-learning-model": "CLASSIFICATION_MACHINE_LEARNING_MODEL",
  data: "CLASSIFICATION_DATA",
  "cryptographic-asset": "CLASSIFICATION_CRYPTOGRAPHIC_ASSET",
} as const;

const EXTERNAL_REFERENCE_TYPES = new Set([
  "vcs",
  "issue-tracker",
  "website",
  "advisories",
  "bom",
  "mailing-list",
  "social",
  "chat",
  "documentation",
  "support",
  "source-distribution",
  "distribution",
  "distribution-intake",
  "license",
  "build-meta",
  "build-system",
  "release-notes",
  "security-contact",
  "model-card",
  "log",
  "configuration",
  "evidence",
  "formulation",
  "attestation",
  "threat-model",
  "adversary-model",
  "risk-assessment",
  "vulnerability-assertion",
  "exploitability-statement",
  "pentest-report",
  "static-analysis-report",
  "dynamic-analysis-report",
  "runtime-analysis-report",
  "component-analysis-report",
  "maturity-report",
  "certification-report",
  "codified-infrastructure",
  "quality-metrics",
  "poam",
  "electronic-signature",
  "digital-signature",
  "rfc-9116",
  "patent",
  "patent-family",
  "patent-assertion",
  "citation",
  "other",
]);

const HASH_ALGORITHM_TO_ENUM_VALUE = {
  MD5: "HASH_ALG_MD_5",
  "SHA-1": "HASH_ALG_SHA_1",
  "SHA-256": "HASH_ALG_SHA_256",
  "SHA-384": "HASH_ALG_SHA_384",
  "SHA-512": "HASH_ALG_SHA_512",
  "SHA3-256": "HASH_ALG_SHA_3_256",
  "SHA3-384": "HASH_ALG_SHA_3_384",
  "SHA3-512": "HASH_ALG_SHA_3_512",
  "BLAKE2b-256": "HASH_ALG_BLAKE_2_B_256",
  "BLAKE2b-384": "HASH_ALG_BLAKE_2_B_384",
  "BLAKE2b-512": "HASH_ALG_BLAKE_2_B_512",
  BLAKE3: "HASH_ALG_BLAKE_3",
  STREEBOG_256: "HASH_ALG_STREEBOG_256",
  STREEBOG_512: "HASH_ALG_STREEBOG_512",
} as const;

const HASH_ENUM_VALUE_TO_ALGORITHM = Object.fromEntries(
  Object.entries(HASH_ALGORITHM_TO_ENUM_VALUE).map(([algorithm, enumValue]) => [
    enumValue,
    algorithm,
  ]),
);

const EVIDENCE_FIELD_TO_ENUM_VALUE = {
  group: "EVIDENCE_FIELD_GROUP",
  name: "EVIDENCE_FIELD_NAME",
  version: "EVIDENCE_FIELD_VERSION",
  purl: "EVIDENCE_FIELD_PURL",
  cpe: "EVIDENCE_FIELD_CPE",
  swid: "EVIDENCE_FIELD_SWID",
  hash: "EVIDENCE_FIELD_HASH",
  omniborId: "EVIDENCE_FIELD_OMNIBOR_ID",
  swhid: "EVIDENCE_FIELD_SWHID",
} as const;

const EVIDENCE_ENUM_VALUE_TO_FIELD = Object.fromEntries(
  Object.entries(EVIDENCE_FIELD_TO_ENUM_VALUE).map(([field, enumValue]) => [
    enumValue,
    field,
  ]),
);

const EVIDENCE_TECHNIQUE_TO_ENUM_VALUE = {
  "source-code-analysis": "EVIDENCE_TECHNIQUE_SOURCE_CODE_ANALYSIS",
  "binary-analysis": "EVIDENCE_TECHNIQUE_BINARY_ANALYSIS",
  "manifest-analysis": "EVIDENCE_TECHNIQUE_MANIFEST_ANALYSIS",
  "ast-fingerprint": "EVIDENCE_TECHNIQUE_AST_FINGERPRINT",
  "hash-comparison": "EVIDENCE_TECHNIQUE_HASH_COMPARISON",
  instrumentation: "EVIDENCE_TECHNIQUE_INSTRUMENTATION",
  "dynamic-analysis": "EVIDENCE_TECHNIQUE_DYNAMIC_ANALYSIS",
  filename: "EVIDENCE_TECHNIQUE_FILENAME",
  attestation: "EVIDENCE_TECHNIQUE_ATTESTATION",
  other: "EVIDENCE_TECHNIQUE_OTHER",
} as const;

const EVIDENCE_ENUM_VALUE_TO_TECHNIQUE = Object.fromEntries(
  Object.entries(EVIDENCE_TECHNIQUE_TO_ENUM_VALUE).map(
    ([technique, enumValue]) => [enumValue, technique],
  ),
);

const SUPPORTED_BINARY_READ_ORDER = [...supportedSpecVersions].reverse();

function isJsonRecord(value: JsonLike): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeBomJsonValue(value: JsonLike): JsonLike {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => entry !== undefined)
      .map((entry) => sanitizeBomJsonValue(entry));
  }

  if (isJsonRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, sanitizeBomJsonValue(entry)]),
    );
  }

  return value;
}

function normalizeLifecyclePhaseForProto(phase: unknown): unknown {
  const normalizedPhase = `${phase ?? ""}`.trim().toLowerCase();
  if (!PREDEFINED_LIFECYCLE_PHASES.has(normalizedPhase)) {
    return phase;
  }

  return PREDEFINED_LIFECYCLE_PHASE_TO_ENUM_VALUE[
    normalizedPhase as keyof typeof PREDEFINED_LIFECYCLE_PHASE_TO_ENUM_VALUE
  ];
}

function normalizeLifecyclePhaseFromProto(phase: unknown): string | undefined {
  const normalizedPhase = `${phase ?? ""}`
    .trim()
    .replace(/^LIFECYCLE_PHASE_/u, "")
    .toLowerCase()
    .replaceAll("_", "-");
  return normalizedPhase === "null" || normalizedPhase === ""
    ? undefined
    : normalizedPhase;
}

function isComponentLikeObject(value: JsonLike): value is JsonRecord {
  return Boolean(
    isJsonRecord(value) &&
      typeof value.name === "string" &&
      typeof value.type === "string",
  );
}

function isExternalReferenceLikeObject(value: JsonLike): value is JsonRecord {
  return Boolean(
    isJsonRecord(value) &&
      typeof value.type === "string" &&
      typeof value.url === "string",
  );
}

function isHashLikeObject(value: JsonLike): value is JsonRecord {
  return Boolean(
    isJsonRecord(value) &&
      typeof value.alg === "string" &&
      (typeof value.content === "string" || typeof value.value === "string"),
  );
}

function isEvidenceIdentityLikeObject(value: JsonLike): value is JsonRecord {
  return Boolean(
    isJsonRecord(value) &&
      typeof value.field === "string" &&
      (value.concludedValue !== undefined || Array.isArray(value.methods)),
  );
}

function isEvidenceMethodLikeObject(value: JsonLike): value is JsonRecord {
  return Boolean(
    isJsonRecord(value) &&
      typeof value.technique === "string" &&
      (value.value !== undefined || value.confidence !== undefined),
  );
}

function normalizeComponentTypeForProto(type: unknown): unknown {
  const normalizedType = `${type ?? ""}`.trim().toLowerCase();
  return (
    COMPONENT_TYPE_TO_ENUM_VALUE[
      normalizedType as keyof typeof COMPONENT_TYPE_TO_ENUM_VALUE
    ] ?? type
  );
}

function normalizeComponentTypeFromProto(type: unknown): string | undefined {
  const normalizedType = `${type ?? ""}`
    .trim()
    .replace(/^CLASSIFICATION_/u, "")
    .toLowerCase()
    .replaceAll("_", "-");
  return normalizedType === "null" || normalizedType === ""
    ? undefined
    : normalizedType;
}

function normalizeExternalReferenceTypeForProto(type: unknown): unknown {
  const normalizedType = `${type ?? ""}`.trim().toLowerCase();
  if (!EXTERNAL_REFERENCE_TYPES.has(normalizedType)) {
    return type;
  }

  return `EXTERNAL_REFERENCE_TYPE_${normalizedType.toUpperCase().replaceAll("-", "_")}`;
}

function normalizeExternalReferenceTypeFromProto(
  type: unknown,
): string | undefined {
  const normalizedType = `${type ?? ""}`
    .trim()
    .replace(/^EXTERNAL_REFERENCE_TYPE_/u, "")
    .toLowerCase()
    .replaceAll("_", "-");
  return normalizedType === "null" || normalizedType === ""
    ? undefined
    : normalizedType;
}

function normalizeHashAlgorithmForProto(algorithm: unknown): unknown {
  return (
    HASH_ALGORITHM_TO_ENUM_VALUE[
      `${algorithm ?? ""}`.trim() as keyof typeof HASH_ALGORITHM_TO_ENUM_VALUE
    ] ?? algorithm
  );
}

function normalizeHashAlgorithmFromProto(
  algorithm: unknown,
): string | undefined {
  const normalizedAlgorithm =
    HASH_ENUM_VALUE_TO_ALGORITHM[`${algorithm ?? ""}`.trim()];
  return normalizedAlgorithm === "NULL" || normalizedAlgorithm === ""
    ? undefined
    : normalizedAlgorithm;
}

function normalizeEvidenceFieldForProto(field: unknown): unknown {
  return (
    EVIDENCE_FIELD_TO_ENUM_VALUE[
      `${field ?? ""}`.trim() as keyof typeof EVIDENCE_FIELD_TO_ENUM_VALUE
    ] ?? field
  );
}

function normalizeEvidenceFieldFromProto(field: unknown): string | undefined {
  const normalizedField = EVIDENCE_ENUM_VALUE_TO_FIELD[`${field ?? ""}`.trim()];
  return normalizedField === "null" || normalizedField === ""
    ? undefined
    : normalizedField;
}

function normalizeEvidenceTechniqueForProto(technique: unknown): unknown {
  return (
    EVIDENCE_TECHNIQUE_TO_ENUM_VALUE[
      `${technique ?? ""}`.trim() as keyof typeof EVIDENCE_TECHNIQUE_TO_ENUM_VALUE
    ] ?? technique
  );
}

function normalizeEvidenceTechniqueFromProto(
  technique: unknown,
): string | undefined {
  const normalizedTechnique =
    EVIDENCE_ENUM_VALUE_TO_TECHNIQUE[`${technique ?? ""}`.trim()];
  return normalizedTechnique === "null" || normalizedTechnique === ""
    ? undefined
    : normalizedTechnique;
}

function normalizeComponentLikeValueForProto(value: JsonLike): JsonLike {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeComponentLikeValueForProto(entry));
  }

  if (!isJsonRecord(value)) {
    return value;
  }

  const normalizedValue = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      normalizeComponentLikeValueForProto(entry),
    ]),
  );

  if (isComponentLikeObject(normalizedValue)) {
    return {
      ...normalizedValue,
      type: normalizeComponentTypeForProto(normalizedValue.type),
    };
  }

  if (isHashLikeObject(normalizedValue)) {
    const hashValue = normalizedValue as JsonRecord;
    return {
      ...hashValue,
      alg: normalizeHashAlgorithmForProto(hashValue.alg),
      value: hashValue.content ?? hashValue.value,
    };
  }

  if (isEvidenceIdentityLikeObject(normalizedValue)) {
    const evidenceIdentityValue = normalizedValue as JsonRecord;
    return {
      ...evidenceIdentityValue,
      field: normalizeEvidenceFieldForProto(evidenceIdentityValue.field),
    };
  }

  if (isEvidenceMethodLikeObject(normalizedValue)) {
    const evidenceMethodValue = normalizedValue as JsonRecord;
    return {
      ...evidenceMethodValue,
      technique: normalizeEvidenceTechniqueForProto(
        evidenceMethodValue.technique,
      ),
    };
  }

  if (isExternalReferenceLikeObject(normalizedValue)) {
    const externalReferenceValue = normalizedValue as JsonRecord;
    return {
      ...externalReferenceValue,
      type: normalizeExternalReferenceTypeForProto(externalReferenceValue.type),
    };
  }

  return normalizedValue;
}

function normalizeComponentLikeValueFromProto(value: JsonLike): JsonLike {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeComponentLikeValueFromProto(entry));
  }

  if (!isJsonRecord(value)) {
    return value;
  }

  const normalizedValue = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      normalizeComponentLikeValueFromProto(entry),
    ]),
  );

  if (isComponentLikeObject(normalizedValue)) {
    return {
      ...normalizedValue,
      type: normalizeComponentTypeFromProto(normalizedValue.type),
    };
  }

  if (isHashLikeObject(normalizedValue)) {
    const hashValue = normalizedValue as JsonRecord;
    return {
      ...hashValue,
      alg: normalizeHashAlgorithmFromProto(hashValue.alg),
      content: hashValue.value ?? hashValue.content,
      value: undefined,
    };
  }

  if (isEvidenceIdentityLikeObject(normalizedValue)) {
    const evidenceIdentityValue = normalizedValue as JsonRecord;
    return {
      ...evidenceIdentityValue,
      field: normalizeEvidenceFieldFromProto(evidenceIdentityValue.field),
    };
  }

  if (isEvidenceMethodLikeObject(normalizedValue)) {
    const evidenceMethodValue = normalizedValue as JsonRecord;
    return {
      ...evidenceMethodValue,
      technique: normalizeEvidenceTechniqueFromProto(
        evidenceMethodValue.technique,
      ),
    };
  }

  if (isExternalReferenceLikeObject(normalizedValue)) {
    const externalReferenceValue = normalizedValue as JsonRecord;
    return {
      ...externalReferenceValue,
      type: normalizeExternalReferenceTypeFromProto(
        externalReferenceValue.type,
      ),
    };
  }

  return normalizedValue;
}

function buildLifecycleMessages(
  specVersion: SupportedSpecVersion,
  lifecycles: JsonLike,
): unknown {
  const lifecycleBuilder =
    LIFECYCLE_MESSAGE_BUILDERS[
      specVersion as keyof typeof LIFECYCLE_MESSAGE_BUILDERS
    ];
  if (!lifecycleBuilder || !Array.isArray(lifecycles)) {
    return lifecycles;
  }

  return lifecycles.map((lifecycle) => {
    const lifecycleRecord = isJsonRecord(lifecycle) ? lifecycle : {};
    if (typeof lifecycleRecord.phase === "string") {
      const { phase, ...rest } = lifecycleRecord;
      const lifecyclePhase = normalizeLifecyclePhaseForProto(phase);
      return create(lifecycleBuilder.schema, {
        ...rest,
        choice: {
          case: "phase",
          value:
            lifecycleBuilder.phaseEnum[
              `${lifecyclePhase}` as keyof typeof lifecycleBuilder.phaseEnum
            ] ?? lifecycleBuilder.phaseEnum.DESIGN,
        },
      });
    }

    if (typeof lifecycleRecord.name === "string") {
      const { name, ...rest } = lifecycleRecord;
      return create(lifecycleBuilder.schema, {
        ...rest,
        choice: {
          case: "name",
          value: name,
        },
      });
    }

    return create(lifecycleBuilder.schema, lifecycleRecord);
  });
}

function patchParsedBomMessage(
  bomMessage: AnyBom,
  bomJson: JsonLike,
  specVersion: SupportedSpecVersion,
): AnyBom {
  if (
    !isJsonRecord(bomJson) ||
    !isJsonRecord(bomJson.metadata) ||
    !bomMessage.metadata
  ) {
    return bomMessage;
  }

  if (!Array.isArray(bomJson.metadata.lifecycles)) {
    return bomMessage;
  }

  bomMessage.metadata.lifecycles = buildLifecycleMessages(
    specVersion,
    bomJson.metadata.lifecycles,
  ) as typeof bomMessage.metadata.lifecycles;
  return bomMessage;
}

function normalizeBomJsonFromProto(bomJson: JsonLike, bom?: AnyBom): JsonLike {
  if (!isJsonRecord(bomJson)) {
    return bomJson;
  }

  const metadata = isJsonRecord(bomJson.metadata)
    ? bomJson.metadata
    : undefined;
  const normalizedMetadata = metadata
    ? {
        ...metadata,
        lifecycles: Array.isArray(metadata.lifecycles)
          ? metadata.lifecycles.map((lifecycle) => {
              if (
                !isJsonRecord(lifecycle) ||
                typeof lifecycle.phase !== "string"
              ) {
                return lifecycle;
              }

              return {
                ...lifecycle,
                phase: normalizeLifecyclePhaseFromProto(lifecycle.phase),
              };
            })
          : metadata.lifecycles,
      }
    : metadata;

  return sanitizeBomJsonValue(
    normalizeComponentLikeValueFromProto({
      bomFormat: "CycloneDX",
      ...bomJson,
      metadata: normalizedMetadata,
      specVersion:
        typeof bomJson.specVersion === "string"
          ? bomJson.specVersion
          : typeof bomJson.spec_version === "string"
            ? bomJson.spec_version
            : bom?.specVersion,
    }),
  );
}

function normalizeSpecVersion(
  specVersion: string | number,
): SupportedSpecVersion {
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

export function detectBomSpecVersion(
  value: BomVersionCarrier,
): SupportedSpecVersion {
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
  const normalizedJson = normalizeComponentLikeValueForProto(
    sanitizeBomJsonValue(json),
  );
  const protoCompatibleJson = isJsonRecord(normalizedJson)
    ? { ...normalizedJson }
    : normalizedJson;
  if (isJsonRecord(protoCompatibleJson)) {
    delete protoCompatibleJson.bomFormat;
    delete protoCompatibleJson.bom_format;
    const versionCarrier = protoCompatibleJson as BomVersionCarrier;
    if (
      versionCarrier.specVersion !== undefined ||
      versionCarrier.spec_version !== undefined
    ) {
      assertMatchingSpecVersion(normalized, versionCarrier);
    }
  }

  const bom = fromJson(
    getBomSchema(normalized),
    protoCompatibleJson as JsonValue,
    options,
  );
  if (!bom.specVersion) {
    bom.specVersion = normalized;
  }

  return patchParsedBomMessage(bom, protoCompatibleJson, normalized);
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
  return decodeBomJson(specVersion, JSON.parse(json) as JsonValue, options);
}

export function parseBomJson(
  json: JsonValue,
  options?: Partial<JsonReadOptions>,
): AnyBom {
  const normalizedJson = normalizeComponentLikeValueForProto(
    sanitizeBomJsonValue(json),
  );
  if (!isJsonRecord(normalizedJson)) {
    throw new Error("CycloneDX BOM JSON must be an object.");
  }

  return decodeBomJson(
    detectBomSpecVersion(normalizedJson as BomVersionCarrier),
    normalizedJson as JsonValue,
    options,
  );
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
): JsonValue {
  return normalizeBomJsonFromProto(
    toJson(getBomSchemaForBom(bom), bom, options),
    bom,
  ) as JsonValue;
}

export function parseBomBinary(
  bytes: Uint8Array,
  options?: Partial<BinaryReadOptions>,
): AnyBom {
  let lastError: unknown;
  for (const specVersion of SUPPORTED_BINARY_READ_ORDER) {
    try {
      return decodeBomBinary(specVersion, bytes, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw (
    lastError ?? new Error("Unable to decode CycloneDX protobuf BOM binary.")
  );
}

export function encodeBomJsonString(
  bom: AnyBom,
  options?: Partial<JsonWriteStringOptions>,
): string {
  return JSON.stringify(
    encodeBomJson(bom, options),
    undefined,
    options?.prettySpaces ?? 0,
  );
}
