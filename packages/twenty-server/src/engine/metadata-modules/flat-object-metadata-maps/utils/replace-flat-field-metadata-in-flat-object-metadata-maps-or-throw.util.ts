import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';

export type ReplaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs = {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: ReplaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
  const flatObjectMetadataMapsWithoutFlatFieldMetadataToReplace =
    deleteFieldFromFlatObjectMetadataMapsOrThrow({
      fieldMetadataId: flatFieldMetadata.id,
      flatObjectMetadataMaps,
      objectMetadataId: flatFieldMetadata.objectMetadataId,
    });

  return addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
    flatFieldMetadata,
    flatObjectMetadataMaps:
      flatObjectMetadataMapsWithoutFlatFieldMetadataToReplace,
  });
};
