import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/delete-flat-entity-from-flat-entity-maps-through-mutation-or-throw.util';

export type ReplaceFlatEntityInFlatEntityMapsThroughMutationOrThrowArgs<
  T extends SyncableFlatEntity,
> = {
  flatEntity: T;
  flatEntityMapsToMutate: FlatEntityMaps<T>;
};

export const replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntity,
  flatEntityMapsToMutate,
}: ReplaceFlatEntityInFlatEntityMapsThroughMutationOrThrowArgs<T>): void => {
  deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
    flatEntityMapsToMutate,
    entityToDeleteId: flatEntity.id,
  });

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity,
    flatEntityMapsToMutate,
  });
};
