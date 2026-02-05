import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-by-metadata-name.constant';

type ExtractKeysWithToStringify<T> = {
  [K in keyof T]: T[K] extends { toStringify: true } ? K : never;
}[keyof T];

export type MetadataUniversalFlatEntityPropertiesToStringify<T extends AllMetadataName> =
  ExtractKeysWithToStringify<
    (typeof ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME)[T]
  >;
