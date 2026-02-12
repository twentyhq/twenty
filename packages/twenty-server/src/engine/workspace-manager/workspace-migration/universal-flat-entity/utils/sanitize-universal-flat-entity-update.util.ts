import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';

export const sanitizeUniversalFlatEntityUpdate = <T extends AllMetadataName>({
  flatEntityUpdate,
  metadataName,
}: {
  flatEntityUpdate: UniversalFlatEntityUpdate<T>;
  metadataName: T;
}): UniversalFlatEntityUpdate<T> => {
  const { propertiesToCompare } =
    ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[metadataName];

  const initialAccumulator: UniversalFlatEntityUpdate<T> = {};

  return propertiesToCompare.reduce((accumulator, property) => {
    const updatedValue = flatEntityUpdate[property];

    if (updatedValue === undefined) {
      return accumulator;
    }

    return {
      ...accumulator,
      [property]: updatedValue,
    };
  }, initialAccumulator);
};
