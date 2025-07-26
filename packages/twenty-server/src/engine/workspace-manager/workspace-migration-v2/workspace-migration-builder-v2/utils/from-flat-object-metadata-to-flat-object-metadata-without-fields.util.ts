import {
  FlatObjectMetadata,
  FlatObjectMetadataWithoutFields,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';

export const fromFlatObjectMetadataToFlatObjectMetadataWithoutFields = ({
  flatFieldMetadatas: _flatFieldMetadatas,
  flatIndexMetadatas: _flatIndexMetadatas,
  ...rest
}: FlatObjectMetadata): FlatObjectMetadataWithoutFields => rest;
