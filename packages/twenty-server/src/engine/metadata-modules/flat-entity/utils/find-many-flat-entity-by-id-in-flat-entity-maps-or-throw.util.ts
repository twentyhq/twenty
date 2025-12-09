import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-or-throw.util';

export type FindManyFlatEntityByIdInFlatEntityMapsOrThrowArgs<
  T extends SyncableFlatEntity,
> = {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityIds: string[];
};
export const findManyFlatEntityByIdInFlatEntityMapsOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  flatEntityIds,
}: FindManyFlatEntityByIdInFlatEntityMapsOrThrowArgs<T>): T[] => {
  const subFlatEntityMaps = getSubFlatEntityMapsOrThrow<T>({
    flatEntityIds,
    flatEntityMaps,
  });

  return Object.values(subFlatEntityMaps.byId).filter(isDefined);
};
