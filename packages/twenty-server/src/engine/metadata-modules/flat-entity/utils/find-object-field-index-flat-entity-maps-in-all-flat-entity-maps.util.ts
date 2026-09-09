import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type ObjectFieldIndexFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/object-field-index-flat-entity-maps.type';

export const findObjectFieldIndexFlatEntityMapsInAllFlatEntityMaps = (
  allFlatEntityMaps: Partial<AllFlatEntityMaps>,
): ObjectFieldIndexFlatEntityMaps | undefined => {
  const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
    allFlatEntityMaps;

  if (!isDefined(flatObjectMetadataMaps) || !isDefined(flatFieldMetadataMaps)) {
    return undefined;
  }

  return { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps };
};
