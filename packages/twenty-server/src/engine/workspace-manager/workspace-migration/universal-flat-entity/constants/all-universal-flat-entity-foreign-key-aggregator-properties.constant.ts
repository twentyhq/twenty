import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';

type ExtractUniversalForeignKeyAggregators<OneToManyRelations> = {
  [K in keyof OneToManyRelations]: OneToManyRelations[K] extends {
    universalFlatEntityForeignKeyAggregator: infer Agg extends string;
  }
    ? Agg
    : never;
}[keyof OneToManyRelations];

export type ExtractUniversalForeignKeyAggregatorForMetadataName<
  T extends AllMetadataName,
> = ExtractUniversalForeignKeyAggregators<
  (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[T]
>;

type UniversalFlatEntityForeignKeyAggregatorProperties = {
  [P in AllMetadataName]: ExtractUniversalForeignKeyAggregatorForMetadataName<P>[];
};

const computeForeignKeyAggregatorProperties = <T extends AllMetadataName>(
  metadataName: T,
): ExtractUniversalForeignKeyAggregatorForMetadataName<T>[] => {
  const oneToManyRelations = ALL_ONE_TO_MANY_METADATA_RELATIONS[metadataName];

  const aggregatorProperties: ExtractUniversalForeignKeyAggregatorForMetadataName<T>[] =
    [];

  for (const relation of Object.values(oneToManyRelations)) {
    if (!isDefined(relation)) {
      continue;
    }

    if (isDefined(relation.universalFlatEntityForeignKeyAggregator)) {
      aggregatorProperties.push(
        relation.universalFlatEntityForeignKeyAggregator as ExtractUniversalForeignKeyAggregatorForMetadataName<T>,
      );
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
