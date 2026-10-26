import { isUndefined } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

const SERVER_MANAGED_PROPERTIES = new Set(['createdAt', 'updatedAt']);

// An undefined incoming property (removed column, workspace-owned value) is not part of the change
export const findNonUpdatablePropertyDivergences = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
}: FromTo<MetadataUniversalFlatEntity<T>, 'universalFlatEntity'> & {
  metadataName: T;
}): string[] =>
  Object.entries(
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName],
  )
    .filter(
      ([property, { toCompare }]) =>
        !toCompare && !SERVER_MANAGED_PROPERTIES.has(property),
    )
    .map(([property, { universalProperty }]) => universalProperty ?? property)
    .filter((universalProperty) => {
      const key = universalProperty as keyof MetadataUniversalFlatEntity<T>;

      return (
        !isUndefined(toUniversalFlatEntity[key]) &&
        !isEqual(fromUniversalFlatEntity[key], toUniversalFlatEntity[key])
      );
    });
