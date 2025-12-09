import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const createEmptyFlatEntityMaps = () =>
  ({
    byId: {},
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  }) as const satisfies FlatEntityMaps<SyncableFlatEntity>;
