import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps.util';
import { dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/dispatch-and-add-flat-field-metadata-in-flat-object-metadata-maps.util';

export const dispatchAndReplaceFlatFieldMetadataInFlatObjectMetadataMaps = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
}): FlatObjectMetadataMaps => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[flatFieldMetadata.objectMetadataId];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    throw new Error('TOOD'); // TODO prastoin custom exception or swallow
  }

  const flatObjectMetadataMapsWithFlatFieldMetadata =
    deleteFieldFromFlatObjectMetadataMaps({
      fieldMetadataId: flatFieldMetadata.id,
      flatObjectMetadataMaps,
      objectMetadataId: flatFieldMetadata.objectMetadataId,
    });

  return dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps({
    flatFieldMetadata,
    flatObjectMetadataMaps: flatObjectMetadataMapsWithFlatFieldMetadata,
  });
};
