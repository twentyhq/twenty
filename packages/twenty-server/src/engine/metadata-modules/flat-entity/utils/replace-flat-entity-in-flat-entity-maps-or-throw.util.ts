import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';

export type ReplaceFlatEntityInFlatEntityMapsOrThrowArgs<
  T extends SyncableFlatEntity,
> = {
  flatEntity: T;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const replaceFlatEntityInFlatEntityMapsOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntity,
  flatEntityMaps,
}: ReplaceFlatEntityInFlatEntityMapsOrThrowArgs<T>): FlatEntityMaps<T> => {
  const flatEntityMapsToReplace = deleteFlatEntityFromFlatEntityMapsOrThrow({
    flatEntityMaps,
    entityToDeleteId: flatEntity.id,
  });

  return addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity,
    flatEntityMaps: flatEntityMapsToReplace,
  });
};
