# cdx-proto

Runtime library to serialize/deserialize CycloneDX BOM with protocol buffers. The project was generated using [protoc-gen-es](https://github.com/bufbuild/protobuf-es) from the official [proto](https://github.com/CycloneDX/specification/blob/master/schema/bom-1.5.proto) specification.

## 2.0.0 highlights

- version-specific subpath exports: `@appthreat/cdx-proto/v1.5`, `v1.6`, and `v1.7`
- helper APIs for schema selection and BOM encode/decode workflows
- leaner npm package contents that no longer publish generated `docs/`

## Sample usage

```js
import {
  createBom,
  decodeBomBinary,
  encodeBomBinary,
  encodeBomJson,
  getBomSchema,
  parseBomJson,
} from "@appthreat/cdx-proto";
import { BomSchema as BomSchema16 } from "@appthreat/cdx-proto/v1.6";
import {
  fromJson,
} from "@bufbuild/protobuf";

// Use version-specific entrypoints when you only need one schema version.
const bom16 = fromJson(BomSchema16, {
  specVersion: "1.6",
  version: 1,
});

// Or use the helper API to auto-select schemas and encode/decode BOMs.
const bom = createBom("1.7", {
  version: 1,
  serialNumber: "urn:uuid:11111111-1111-1111-1111-111111111111",
});

const binary = encodeBomBinary(bom, {
  writeUnknownFields: true,
});

const decoded = decodeBomBinary("1.7", binary, {
  readUnknownFields: true,
});

const json = encodeBomJson(decoded, {
  alwaysEmitImplicit: true,
});

const parsed = parseBomJson({
  specVersion: "1.6",
  version: 1,
});

const schema = getBomSchema(parsed.specVersion);
```

### Helper API

- `getBomSchema(specVersion)` returns the matching `BomSchema` for CycloneDX `1.5`, `1.6`, or `1.7`.
- `createBom(specVersion, init)` creates a BOM message and automatically sets `specVersion`.
- `parseBomJson(json)` and `parseBomJsonString(json)` auto-detect the schema from `specVersion` / `spec_version`.
- `decodeBomBinary(specVersion, bytes)` decodes a protobuf BOM when the schema version is known.
- `encodeBomBinary(bom)`, `encodeBomJson(bom)`, and `encodeBomJsonString(bom)` choose the correct schema from the BOM itself.

### Version-specific imports

Use subpath exports to avoid loading schema versions you do not need:

```js
import { BomSchema as BomSchema15 } from "@appthreat/cdx-proto/v1.5";
import { BomSchema as BomSchema16 } from "@appthreat/cdx-proto/v1.6";
import { BomSchema as BomSchema17 } from "@appthreat/cdx-proto/v1.7";
```

## License

Apache-2.0
