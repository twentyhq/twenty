import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/dispatch-and-add-flat-field-metadata-in-flat-object-metadata-maps.util';

export const updateFlatFieldMetadataInFlatObjectMetadataMapsOrThrow = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
}): FlatObjectMetadataMaps | undefined => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[flatFieldMetadata.objectMetadataId];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    throw new Error(
      'updateFlatFieldMetadataInFlatObjectMetadataMapsOrThrow: updated flat field metadata parent object metadata not found',
    );
  }

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
