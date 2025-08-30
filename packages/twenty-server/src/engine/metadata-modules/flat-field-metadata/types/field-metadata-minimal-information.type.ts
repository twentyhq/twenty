import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type FieldMetadataMinimalInformation = Pick<
  FlatFieldMetadata,
  'id' | 'objectMetadataId' | 'name'
>;
