import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import {
  ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityOverridablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

const computeOverridableProperties = <T extends AllMetadataName>(
  metadataName: T,
): MetadataEntityOverridablePropertyName<T>[] => {
  const config =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];

  return (Object.entries(config) as [string, { isOverridable?: boolean }][])
    .filter(([_, conf]) => conf.isOverridable === true)
    .map(([property]) => property as MetadataEntityOverridablePropertyName<T>);
};

export const ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME = Object.values(
  ALL_METADATA_NAME,
).reduce(
  (acc, metadataName) => ({
    ...acc,
    [metadataName]: computeOverridableProperties(metadataName),
  }),
  {} as {
    [P in AllMetadataName]: MetadataEntityOverridablePropertyName<P>[];
  },
);

// isActive is overridable for attribution only: the column stays the value
// every reader uses, so presentation resolvers must not resolve it as a label.
export const ALL_OVERRIDABLE_PRESENTATION_PROPERTIES_BY_METADATA_NAME =
  Object.fromEntries(
    Object.entries(ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME).map(
      ([metadataName, properties]) => [
        metadataName,
        (properties as string[]).filter((property) => property !== 'isActive'),
      ],
    ),
  ) as {
    [P in AllMetadataName]: Exclude<
      MetadataEntityOverridablePropertyName<P>,
      'isActive'
    >[];
  };
