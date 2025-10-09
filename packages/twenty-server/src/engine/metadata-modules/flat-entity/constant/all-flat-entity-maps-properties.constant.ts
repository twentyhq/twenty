import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const ALL_FLAT_ENTITY_MAPS_PROPERTIES = [
  'flatObjectMetadataMaps',
  'flatViewFieldMaps',
  'flatViewMaps',
  'flatIndexMaps',
  'flatServerlessFunctionMaps',
  'flatDatabaseEventTriggerMaps',
  'flatCronTriggerMaps',
  'flatRouteTriggerMaps',
  'flatFieldMetadataMaps',
  'flatViewFilterMaps',
] as const satisfies (keyof AllFlatEntityMaps)[];
