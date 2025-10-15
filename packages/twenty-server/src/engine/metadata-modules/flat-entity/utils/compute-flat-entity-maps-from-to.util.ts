import { AllFlatEntities } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FromTo } from 'twenty-shared/types';

type ComputeFlatEntityMapsFromToArgs<T extends AllFlatEntities> = {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityToUpdate: T[];
  flatEntityToCreate: T[];
  flatEntityToDelete: T[];
};
export const computeFlatEntityMapsFromTo = <T extends AllFlatEntities>({
  flatEntityMaps,
  flatEntityToCreate,
  flatEntityToDelete,
  flatEntityToUpdate,
}: ComputeFlatEntityMapsFromToArgs<T>): FromTo<
  FlatEntityMaps<T>,
  'flatEntityMaps'
> => {
  const fromFlatEntityMaps =
    flatEntityToDelete.length > 0
      ? getSubFlatEntityMapsOrThrow({
          flatEntityIds: [...flatEntityToDelete, ...flatEntityToUpdate].map(
            ({ id }) => id,
          ),
          flatEntityMaps,
        })
      : flatEntityMaps;

  const toFlatEntityMapsWithDeleted = flatEntityToDelete.reduce(
    (flatEntityMaps, flatEntity) =>
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: flatEntity.id,
        flatEntityMaps,
      }),
    fromFlatEntityMaps,
  );

  const toFlatEntityMapsWithUpdated = flatEntityToUpdate.reduce(
    (flatEntityMaps, flatEntity) =>
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps,
      }),
    toFlatEntityMapsWithDeleted,
  );

  const toFlatEntityMaps = flatEntityToCreate.reduce(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps,
      }),
    toFlatEntityMapsWithUpdated,
  );

  return {
    fromFlatEntityMaps,
    toFlatEntityMaps,
  };
};
