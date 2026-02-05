import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import {
  type MetadataUniversalFlatEntityPropertiesToCompare,
  type UniversalFlatEntityUpdate,
} from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';

export const sanitizeFlatEntityUpdate = <T extends AllMetadataName>({
  flatEntityUpdate,
  metadataName,
}: {
  flatEntityUpdate: UniversalFlatEntityUpdate<T>;
  metadataName: T;
}): UniversalFlatEntityUpdate<T> => {
  const propertyConfiguration =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];
  const propertiesToCompare = Object.keys(propertyConfiguration) as string[];

  const initialAccumulator: UniversalFlatEntityUpdate<T> = {};

  return propertiesToCompare.reduce((accumulator, property) => {
    const updatedValue =
      flatEntityUpdate[
        property as MetadataUniversalFlatEntityPropertiesToCompare<T>
      ];

    if (updatedValue === undefined) {
      return accumulator;
    }

    return {
      ...accumulator,
      [property]: updatedValue,
    };
  }, initialAccumulator);
};
