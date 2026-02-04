import { ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-and-stringify.constant';
import {
  FlatEntityUpdate,
  MetadataFlatEntityComparableProperties,
} from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export const sanitizeFlatEntityUpdate = <T extends AllMetadataName>({
  flatEntityUpdate,
  metadataName,
}: {
  flatEntityUpdate: FlatEntityUpdate<T>;
  metadataName: T;
}): FlatEntityUpdate<T> => {
  const { propertiesToCompare } =
    ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[metadataName];

  const initialAccumulator: FlatEntityUpdate<T> = {};
  return propertiesToCompare.reduce((accumulator, property) => {
    const updatedValue =
      flatEntityUpdate[property as MetadataFlatEntityComparableProperties<T>];

    if (updatedValue === undefined) {
      return accumulator;
    }

    return {
      ...accumulator,
      [property]: updatedValue,
    };
  }, initialAccumulator);
};
