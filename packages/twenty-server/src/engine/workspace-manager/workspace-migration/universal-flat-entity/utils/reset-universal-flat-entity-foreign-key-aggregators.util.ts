import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES,
  type ExtractUniversalForeignKeyAggregatorForMetadataName,
} from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-flat-entity-foreign-key-aggregator-properties.constant';

export const getUniversalFlatEntityEmptyForeignKeyAggregators = <
  T extends AllMetadataName,
>({
  metadataName,
}: {
  metadataName: T;
}) => {
  const aggregatorProperties =
    ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES[metadataName];

  const emptyAggregatorsRecord = {} as Record<
    ExtractUniversalForeignKeyAggregatorForMetadataName<T>,
    string[]
  >;

  for (const aggregatorProperty of aggregatorProperties) {
    emptyAggregatorsRecord[aggregatorProperty] = [];
  }

  return emptyAggregatorsRecord;
};

export const resetUniversalFlatEntityForeignKeyAggregators = <
  T extends AllMetadataName,
>({
  universalFlatEntity,
  metadataName,
}: {
  universalFlatEntity: MetadataUniversalFlatEntity<T>;
  metadataName: T;
}): MetadataUniversalFlatEntity<T> => {
  const overrides = getUniversalFlatEntityEmptyForeignKeyAggregators({
    metadataName,
  });

  return {
    ...universalFlatEntity,
    ...overrides,
  };
};
