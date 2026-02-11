import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export const toUniversalFlatEntity = <T extends AllMetadataName>({
  metadataName,
  flatEntity,
}: {
  metadataName: T;
  flatEntity: MetadataFlatEntity<T>;
}): MetadataUniversalFlatEntity<T> => {
  const config =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];
  const result: Record<string, unknown> = {};

  for (const [key, propertyConfig] of Object.entries(config)) {
    const universalKey = propertyConfig.universalProperty ?? key;

    result[universalKey] = (flatEntity as Record<string, unknown>)[
      universalKey
    ];
  }

  result.universalIdentifier = flatEntity.universalIdentifier;
  result.applicationUniversalIdentifier =
    flatEntity.applicationUniversalIdentifier;

  return result as MetadataUniversalFlatEntity<T>;
};
