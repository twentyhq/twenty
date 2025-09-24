import {
  type FlatObjectMetadata,
  type FlatObjectMetadataWithoutFields,
} from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const fromFlatObjectMetadataToFlatObjectMetadataWithoutFields = ({
  flatFieldMetadatas: _flatFieldMetadatas,
  ...rest
}: FlatObjectMetadata): FlatObjectMetadataWithoutFields => rest;
