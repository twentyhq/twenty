import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import {
  type MetadataEntityOverridablePropertyName,
  OVERRIDABLE_PROPERTIES_BY_METADATA_NAME,
} from 'src/engine/metadata-modules/flat-entity/constant/overridable-properties-by-metadata-name.constant';

const computeOverridableProperties = <T extends AllMetadataName>(
  metadataName: T,
): MetadataEntityOverridablePropertyName<T>[] =>
  Object.keys(
    OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[metadataName],
  ) as MetadataEntityOverridablePropertyName<T>[];

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
