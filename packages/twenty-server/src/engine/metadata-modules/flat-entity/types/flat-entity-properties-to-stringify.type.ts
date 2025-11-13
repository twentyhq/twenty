import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-and-stringify.constant';

export type FlatEntityPropertiesToStringify<T extends AllMetadataName> =
  (typeof ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY)[T]['propertiesToStringify'][number];
