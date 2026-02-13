import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-flat-entity-foreign-key-aggregator-properties.constant';

export const resetUniversalFlatEntityForeignKeyAggregators = <
  T extends AllMetadataName,
>({
  universalFlatEntity,
  metadataName,
}: {
  universalFlatEntity: MetadataUniversalFlatEntity<T>;
  metadataName: T;
}): MetadataUniversalFlatEntity<T> => {
  const aggregatorProperties =
    ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES[metadataName];

  if (aggregatorProperties.length === 0) {
    return universalFlatEntity;
  }

  const overrides: Record<string, string[]> = {};

  for (const aggregatorProperty of aggregatorProperties) {
    if (aggregatorProperty in universalFlatEntity) {
      overrides[aggregatorProperty] = [];
    }
  }

  return {
    ...universalFlatEntity,
    ...overrides,
  };
};
