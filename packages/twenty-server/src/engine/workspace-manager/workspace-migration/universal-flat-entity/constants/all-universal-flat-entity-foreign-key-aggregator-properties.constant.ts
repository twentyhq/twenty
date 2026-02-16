import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_UNIVERSAL_METADATA_RELATIONS } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-metadata-relations.constant';

type ExtractForeignKeyAggregatorFromManyToOneRelations<
  ManyToOneRelations,
  TargetMetadataName extends AllMetadataName,
> = {
  [K in keyof ManyToOneRelations]: ManyToOneRelations[K] extends {
    metadataName: TargetMetadataName;
    universalFlatEntityForeignKeyAggregator: infer Agg;
  }
    ? Agg extends string
      ? Agg
      : never
    : never;
}[keyof ManyToOneRelations];

export type ExtractUniversalForeignKeyAggregatorForMetadataName<
  T extends AllMetadataName,
> = {
  [M in AllMetadataName]: ExtractForeignKeyAggregatorFromManyToOneRelations<
    (typeof ALL_UNIVERSAL_METADATA_RELATIONS)[M]['manyToOne'],
    T
  >;
}[AllMetadataName];

type UniversalFlatEntityForeignKeyAggregatorProperties = {
  [P in AllMetadataName]: ExtractUniversalForeignKeyAggregatorForMetadataName<P>[];
};

const computeForeignKeyAggregatorProperties = <T extends AllMetadataName>(
  metadataName: T,
): ExtractUniversalForeignKeyAggregatorForMetadataName<T>[] => {
  const aggregatorProperties: ExtractUniversalForeignKeyAggregatorForMetadataName<T>[] =
    [];

  for (const relationsEntry of Object.values(
    ALL_UNIVERSAL_METADATA_RELATIONS,
  )) {
    for (const relation of Object.values(relationsEntry.manyToOne)) {
      if (!isDefined(relation)) {
        continue;
      }

      if (
        relation.metadataName === metadataName &&
        isDefined(relation.universalFlatEntityForeignKeyAggregator)
      ) {
        aggregatorProperties.push(
          relation.universalFlatEntityForeignKeyAggregator as ExtractUniversalForeignKeyAggregatorForMetadataName<T>,
        );
      }
    }
  }

  return aggregatorProperties;
};

export const ALL_UNIVERSAL_FLAT_ENTITY_FOREIGN_KEY_AGGREGATOR_PROPERTIES =
  Object.values(ALL_METADATA_NAME).reduce(
    (acc, metadataName) => ({
      ...acc,
      [metadataName]: computeForeignKeyAggregatorProperties(metadataName),
    }),
    {} as UniversalFlatEntityForeignKeyAggregatorProperties,
  );
