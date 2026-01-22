import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const createEmptyFlatEntityMaps = () =>
  ({
    byId: {},
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  }) as const satisfies FlatEntityMaps<SyncableFlatEntity>;
