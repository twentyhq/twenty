import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export const computeFlatEntityHashByViewId = <
  TFlatEntity extends SyncableFlatEntity & { id: string },
>({
  flatEntityMaps,
  getViewId,
}: {
  flatEntityMaps: FlatEntityMaps<TFlatEntity>;
  getViewId: (flatEntity: TFlatEntity) => string;
}): Map<string, string> => {
  const flatEntitiesByViewId = new Map<string, TFlatEntity[]>();

  const flatEntitiesSortedById = Object.values(
    flatEntityMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .sort((firstFlatEntity, secondFlatEntity) =>
      firstFlatEntity.id.localeCompare(secondFlatEntity.id),
    );

  for (const flatEntity of flatEntitiesSortedById) {
    const viewId = getViewId(flatEntity);
    const flatEntitiesOfView = flatEntitiesByViewId.get(viewId) ?? [];

    flatEntitiesOfView.push(flatEntity);
    flatEntitiesByViewId.set(viewId, flatEntitiesOfView);
  }

  return new Map(
    [...flatEntitiesByViewId].map(([viewId, flatEntitiesOfView]) => [
      viewId,
      createHash('sha256')
        .update(JSON.stringify(flatEntitiesOfView))
        .digest('hex'),
    ]),
  );
};
