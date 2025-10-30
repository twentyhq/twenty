import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

type AddFlatEntityToFlatEntityMapsThroughMutationArgs<T extends FlatEntity> = {
  flatEntity: T;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const addFlatEntityToFlatEntityMapsThroughMutation = <
  T extends FlatEntity,
>({
  flatEntity,
  flatEntityMaps,
}: AddFlatEntityToFlatEntityMapsThroughMutationArgs<T>): boolean => {
  try {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity,
      flatEntityMaps,
    });

    return true;
  } catch {
    return false;
  }
};
