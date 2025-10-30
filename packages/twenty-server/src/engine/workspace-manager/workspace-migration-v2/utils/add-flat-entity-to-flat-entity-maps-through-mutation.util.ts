import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

type AddFlatEntityToFlatEntityMapsThroughMutationArgs<T extends FlatEntity> = {
  flatEntity: T;
  flatEntityMapsToMutate: FlatEntityMaps<T>;
};

export const addFlatEntityToFlatEntityMapsThroughMutation = <
  T extends FlatEntity,
>({
  flatEntity,
  flatEntityMapsToMutate,
}: AddFlatEntityToFlatEntityMapsThroughMutationArgs<T>): boolean => {
  try {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity,
      flatEntityMapsToMutate,
    });

    return true;
  } catch {
    return false;
  }
};
