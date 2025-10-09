import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const EMPTY_ALL_FLAT_ENTITY_MAPS = {
  flatObjectMetadataMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatFieldMetadataMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatIndexMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatViewFieldMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatViewMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatServerlessFunctionMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatCronTriggerMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatDatabaseEventTriggerMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatRouteTriggerMaps: EMPTY_FLAT_ENTITY_MAPS,
  flatViewFilterMaps: EMPTY_FLAT_ENTITY_MAPS,
} as const satisfies AllFlatEntityMaps;
