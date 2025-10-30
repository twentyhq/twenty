import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

export const getSubFlatEntityMapsThroughMutationOrThrow = <
  T extends FlatEntity,
>({
  flatEntityIds,
  flatEntityMaps,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityIds: string[];
}): FlatEntityMaps<T> => {
  const resultToMutate = EMPTY_FLAT_ENTITY_MAPS();

  for (const flatEntityId of flatEntityIds) {
    const flatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId,
      flatEntityMaps,
    });

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity,
      flatEntityMapsToMutate: resultToMutate,
    });
  }

  return resultToMutate;
};
