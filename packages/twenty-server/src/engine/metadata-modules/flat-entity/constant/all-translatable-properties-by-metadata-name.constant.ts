import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import {
  ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityTranslatablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

const computeTranslatableProperties = <T extends AllMetadataName>(
  metadataName: T,
): MetadataEntityTranslatablePropertyName<T>[] => {
  const config =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];

  return (Object.entries(config) as [string, { translatable?: boolean }][])
    .filter(([_, conf]) => conf.translatable === true)
    .map(([property]) => property as MetadataEntityTranslatablePropertyName<T>);
};

export const ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME = Object.values(
  ALL_METADATA_NAME,
).reduce(
  (acc, metadataName) => ({
    ...acc,
    [metadataName]: computeTranslatableProperties(metadataName),
  }),
  {} as {
    [P in AllMetadataName]: MetadataEntityTranslatablePropertyName<P>[];
  },
);
