import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

type FlatEntityFixture = { id: string; universalIdentifier: string };

// Partial fixtures stand in for full flat entities, hence the unknown hop.
export const buildFlatEntityMapsFixture = <T extends SyncableFlatEntity>(
  flatEntities: FlatEntityFixture[],
): FlatEntityMaps<T> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.universalIdentifier,
        flatEntity,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.id,
        flatEntity.universalIdentifier,
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<T>;
