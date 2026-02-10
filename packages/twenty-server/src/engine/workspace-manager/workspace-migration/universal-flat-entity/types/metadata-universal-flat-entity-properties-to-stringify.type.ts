import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type ExtractKeysWithToStringify<T> = {
  [K in keyof T]: T[K] extends { toStringify: true } ? K : never;
}[keyof T];

export type MetadataUniversalFlatEntityPropertiesToStringify<
  T extends AllMetadataName,
> = ExtractKeysWithToStringify<
  (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T]
>;
