import { type ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-and-stringify.constant';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type FlatEntityPropertiesToCompare<T extends AllMetadataName> =
  (typeof ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY)[T]['propertiesToCompare'][number];
