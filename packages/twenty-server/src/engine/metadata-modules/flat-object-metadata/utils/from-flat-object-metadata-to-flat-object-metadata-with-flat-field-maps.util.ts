import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { addFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-to-flat-object-metadata-with-flat-field-maps-or-throw.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const fromFlatObjectMetadataToFlatObjectMetadataWithFlatFieldMaps = (
  flatObjectMetadata: FlatObjectMetadata,
): FlatObjectMetadataWithFlatFieldMaps => {
  const emptyFlatObjectMetadataWithFlatFieldMaps: FlatObjectMetadataWithFlatFieldMaps =
    {
      ...flatObjectMetadata,
      fieldIdByJoinColumnName: {},
      fieldIdByName: {},
      fieldsById: {},
    };

  return flatObjectMetadata.flatFieldMetadatas.reduce(
    (flatObjectMetadataWithFlatFieldMaps, flatFieldMetadata) =>
      addFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMapsOrThrow({
        flatFieldMetadata,
        flatObjectMetadataWithFlatFieldMaps,
      }),
    emptyFlatObjectMetadataWithFlatFieldMaps,
  );
};
