import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { diffUniversalFlatEntityProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/diff-universal-flat-entity-properties.util';

const SERVER_MANAGED_PROPERTIES = new Set(['createdAt', 'updatedAt']);

export const findNonUpdatablePropertyDivergences = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
}: FromTo<MetadataUniversalFlatEntity<T>, 'universalFlatEntity'> & {
  metadataName: T;
}): string[] => {
  const nonComparableProperties = Object.entries(
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName],
  )
    .filter(
      ([property, { toCompare }]) =>
        !toCompare && !SERVER_MANAGED_PROPERTIES.has(property),
    )
    .map(
      ([property, { universalProperty }]) =>
        (universalProperty ?? property) as keyof MetadataUniversalFlatEntity<T>,
    );

  return Object.keys(
    diffUniversalFlatEntityProperties({
      fromUniversalFlatEntity,
      toUniversalFlatEntity,
      metadataName,
      properties: nonComparableProperties,
    }),
  );
};
