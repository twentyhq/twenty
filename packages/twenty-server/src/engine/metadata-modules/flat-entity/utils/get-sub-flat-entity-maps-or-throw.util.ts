import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';

export const getSubFlatEntityMapsOrThrow = <T extends SyncableFlatEntity>({
  flatEntityIds,
  flatEntityMaps,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityIds: string[];
}): FlatEntityMaps<T> => {
  return flatEntityIds.reduce<FlatEntityMaps<T>>((acc, flatEntityId) => {
    const flatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId,
      flatEntityMaps,
    });

    return addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: acc,
    });
  }, createEmptyFlatEntityMaps());
};
