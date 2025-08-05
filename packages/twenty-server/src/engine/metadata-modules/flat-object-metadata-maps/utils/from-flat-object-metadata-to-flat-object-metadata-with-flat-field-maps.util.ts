import { isDefined } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { fromObjectMetadataItemWithFieldMapsToFlatObjectWithFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/from-flat-field-metadata-to-flat-field-metadata-maps.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const fromObjectMetadataMapsToFlatObjectMetadataMaps = (
  objectMetadataMaps: ObjectMetadataMaps,
): FlatObjectMetadataMaps => {
  const initialAccumulator: FlatObjectMetadataMaps['byId'] = {};

  const byId = Object.values(objectMetadataMaps.byId)
    .filter(isDefined)
    .reduce((acc, objectMetadataItemWithFieldMaps) => {
      const { id: objectMetadataId } = objectMetadataItemWithFieldMaps;

      return {
        ...acc,
        [objectMetadataId]:
          fromObjectMetadataItemWithFieldMapsToFlatObjectWithFlatFieldMetadataMaps(
            { objectMetadataItemWithFieldMaps, objectMetadataMaps },
          ),
      };
    }, initialAccumulator);

  return {
    idByNameSingular: objectMetadataMaps.idByNameSingular,
    byId,
  };
};
