import { type ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export type RouteTriggerRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  (typeof ALL_FLAT_ENTITY_CONFIGURATION.routeTrigger.relatedFlatEntityMapsKeys)[number]
>;
