import { type FlatEntityMapsV2 } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const EMPTY_FLAT_ENTITY_MAPS_V2 = {
  byUniversalIdentifier: {},
  idByUniversalIdentifier: {},
  universalIdentifiersByApplicationId: {},
} as const satisfies FlatEntityMapsV2<FlatEntity>;

