import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-to-flat-object-metadata-with-flat-field-maps.util';

export type DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsArgs = {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsArgs):
  | FlatObjectMetadataMaps
  | undefined => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[flatFieldMetadata.objectMetadataId];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    return undefined;
  }

  return {
    byId: {
      ...flatObjectMetadataMaps.byId,
      [flatFieldMetadata.objectMetadataId]:
        addFlatFieldMetadataToFlatObjectMetadataWithFlatFieldMaps({
          flatFieldMetadata,
          flatObjectMetadataWithFlatFieldMaps,
        }),
    },
    idByNameSingular: flatObjectMetadataMaps.idByNameSingular,
  };
};
