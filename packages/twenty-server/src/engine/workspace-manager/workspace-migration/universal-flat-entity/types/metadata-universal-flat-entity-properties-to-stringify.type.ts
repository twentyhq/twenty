import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type ExtractComparableKeysWithToStringify<T> = {
  [K in keyof T]: T[K] extends { toCompare: true; toStringify: true }
    ? K
    : never;
}[keyof T];

export type MetadataUniversalFlatEntityPropertiesToStringify<
  T extends AllMetadataName,
> = ExtractComparableKeysWithToStringify<
  (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T]
>;
