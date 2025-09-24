import { isDefined } from 'twenty-shared/utils';

import { fromObjectMetadataItemWithFieldMapsToFlatObjectWithFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-flat-field-metadata-maps.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

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
    idByUniversalIdentifier: Object.values(objectMetadataMaps.byId)
      .filter(isDefined)
      .reduce(
        (acc, objectMetadata) => ({
          ...acc,
          [objectMetadata.standardId ?? objectMetadata.id]: objectMetadata.id,
        }),
        {},
      ),
    idByNameSingular: objectMetadataMaps.idByNameSingular,
    byId,
  };
};
