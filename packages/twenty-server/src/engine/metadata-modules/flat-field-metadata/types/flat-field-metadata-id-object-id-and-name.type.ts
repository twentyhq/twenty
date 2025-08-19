import { FlatFieldMetadata } from "src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type";

export type FlatFieldMetadataIdObjectIdAndName = Pick<
  FlatFieldMetadata,
  'id' | 'objectMetadataId' | 'name'
>;