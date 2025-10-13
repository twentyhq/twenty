import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const EMPTY_FLAT_ENTITY_MAPS = {
  byId: {},
  idByUniversalIdentifier: {},
} as const satisfies FlatEntityMaps<FlatEntity>;
