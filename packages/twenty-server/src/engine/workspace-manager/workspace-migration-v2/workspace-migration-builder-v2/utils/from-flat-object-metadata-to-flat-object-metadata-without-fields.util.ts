import {
  FlatObjectMetadata,
  FlatObjectMetadataWithoutFields,
} from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const fromFlatObjectMetadataToFlatObjectMetadataWithoutFields = ({
  flatFieldMetadatas: _flatFieldMetadatas,
  flatIndexMetadatas: _flatIndexMetadatas,
  ...rest
}: FlatObjectMetadata): FlatObjectMetadataWithoutFields => rest;
