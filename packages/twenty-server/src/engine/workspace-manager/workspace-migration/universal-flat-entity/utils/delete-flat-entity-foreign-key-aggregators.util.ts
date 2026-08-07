import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { BASE_SCALAR_PROPERTY_NAME } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';

const BASE_WORKSPACE_SCOPED_PROPERTIES = [
  BASE_SCALAR_PROPERTY_NAME.id,
  BASE_SCALAR_PROPERTY_NAME.workspaceId,
  BASE_SCALAR_PROPERTY_NAME.applicationId,
] as const;

export const deleteFlatEntityForeignKeyAggregators = <
  T extends AllMetadataName,
>({
  universalFlatEntity,
  metadataName,
}: {
  universalFlatEntity: MetadataUniversalFlatEntity<T>;
  metadataName: T;
}): MetadataUniversalFlatEntity<T> => {
  const result = { ...universalFlatEntity } as Record<string, unknown>;

  for (const baseProperty of BASE_WORKSPACE_SCOPED_PROPERTIES) {
    delete result[baseProperty];
  }

  const propertiesConfiguration =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];

  for (const [propertyName, propertyConfiguration] of Object.entries(
    propertiesConfiguration,
  ) as [string, { universalProperty?: string }][]) {
    if (isDefined(propertyConfiguration.universalProperty)) {
      delete result[propertyName];
    }
  }

  const oneToManyRelations = ALL_ONE_TO_MANY_METADATA_RELATIONS[metadataName];

  for (const relation of Object.values(oneToManyRelations) as ({
    flatEntityForeignKeyAggregator: string;
  } | null)[]) {
    if (!isDefined(relation)) {
      continue;
    }

    delete result[relation.flatEntityForeignKeyAggregator];
  }

  return result as MetadataUniversalFlatEntity<T>;
};
