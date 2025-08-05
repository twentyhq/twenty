import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FlatFieldMetadataMaps = {
  fieldsById: Partial<Record<string, FlatFieldMetadata>>;
  fieldIdByJoinColumnName: Partial<Record<string, string>>;
  fieldIdByName: Partial<Record<string, string>>;
};

export type FlatObjectMetadataWithFlatFieldMaps = FlatObjectMetadata &
  FlatFieldMetadataMaps;
