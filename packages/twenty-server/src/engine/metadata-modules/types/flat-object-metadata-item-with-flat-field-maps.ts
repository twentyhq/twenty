import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FlatFieldMetadataMap } from 'src/engine/metadata-modules/types/flat-field-metadata-map';

export type FlatObjectMetadataWithFlatFieldMaps = Omit<
  FlatObjectMetadata,
  'flatFieldMetadatas'
> & {
  flatFieldsById: FlatFieldMetadataMap;
  flatFieldIdByJoinColumnName: Record<string, string>; // We should have a uniqueIdentifier map ?
  flatFieldIdByName: Record<string, string>;
  flatIndexMetadatas: FlatIndexMetadata[];
};
