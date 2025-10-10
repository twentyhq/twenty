import { ALL_FLAT_ENTITY_CONSTANTS } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-contants.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export type RouteTriggerRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  (typeof ALL_FLAT_ENTITY_CONSTANTS.routeTrigger.relatedFlatEntityMapsKeys)[number]
>;
