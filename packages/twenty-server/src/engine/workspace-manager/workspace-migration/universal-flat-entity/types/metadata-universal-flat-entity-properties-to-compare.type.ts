import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-by-metadata-name.constant';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type MetadataUniversalFlatEntityPropertiesToCompare<T extends AllMetadataName> = Extract<
  keyof (typeof ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_BY_METADATA_NAME)[T],
  keyof MetadataUniversalFlatEntity<T>
>;
