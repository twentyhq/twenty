import { isDefined } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-with-flat-field-maps.util';

type DeleteFieldFromFlatObjectMetadataMapsArgs = {
  fieldMetadataId: string;
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const deleteFieldFromFlatObjectMetadataMaps = ({
  flatObjectMetadataMaps,
  fieldMetadataId,
  objectMetadataId,
}: DeleteFieldFromFlatObjectMetadataMapsArgs): FlatObjectMetadataMaps => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[objectMetadataId];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    return flatObjectMetadataMaps;
  }

  return {
    byId: {
      ...flatObjectMetadataMaps.byId,
      [objectMetadataId]: deleteFieldFromFlatObjectMetadataWithFlatFieldMaps({
        fieldMetadataId,
        flatObjectMetadataWithFlatFieldMaps,
      }),
    },
    idByNameSingular: flatObjectMetadataMaps.idByNameSingular,
  };
};
