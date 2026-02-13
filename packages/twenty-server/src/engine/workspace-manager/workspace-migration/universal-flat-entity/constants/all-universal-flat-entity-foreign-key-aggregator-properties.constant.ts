import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_UNIVERSAL_METADATA_RELATIONS } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-metadata-relations.constant';

const computeForeignKeyAggregatorProperties = (
  metadataName: AllMetadataName,
): string[] => {
  const aggregatorProperties: string[] = [];

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
          relation.universalFlatEntityForeignKeyAggregator,
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
    {} as {
      [P in AllMetadataName]: string[];
    },
  );
