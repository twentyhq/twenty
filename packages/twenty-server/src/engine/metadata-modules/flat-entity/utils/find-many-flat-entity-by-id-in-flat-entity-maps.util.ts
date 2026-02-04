import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

export type FindManyFlatEntityByIdInFlatEntityMapsArgs<
  T extends SyncableFlatEntity,
> = {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityIds: string[];
};

export const findManyFlatEntityByIdInFlatEntityMaps = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  flatEntityIds,
}: FindManyFlatEntityByIdInFlatEntityMapsArgs<T>): T[] => {
  return flatEntityIds
    .map((flatEntityId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId,
        flatEntityMaps,
      }),
    )
    .filter(isDefined);
};
