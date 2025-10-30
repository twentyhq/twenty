import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/delete-flat-entity-from-flat-entity-maps-through-mutation-or-throw.util';

export type DeleteFlatEntityFromFlatEntityMapsThroughMutationArgs<
  T extends FlatEntity,
> = {
  entityToDeleteId: string;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const deleteFlatEntityFromFlatEntityMapsThroughMutation = <
  T extends FlatEntity,
>({
  flatEntityMaps,
  entityToDeleteId,
}: DeleteFlatEntityFromFlatEntityMapsThroughMutationArgs<T>): boolean => {
  try {
    deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
      flatEntityMaps,
      entityToDeleteId,
    });

    return true;
  } catch {
    return false;
  }
};
